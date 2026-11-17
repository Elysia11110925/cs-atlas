lesson('layers','net','网络分层与封装','协议栈 · 头部 · 封装','网络基础',18,
 [['让每一层专注一种责任','可以用应用、传输、网络、链路四层理解 TCP/IP。HTTP 描述应用消息，TCP 组织可靠字节流，IP 负责跨网络寻址，链路层承载相邻节点之间的传输。'],['从内到外增加信息','发送时各层围绕上层数据附加头部；接收时逐层解析。本节用字符串展示封装顺序，并不生成真实的网络报文或校验和。'],['地址与端口是不同坐标','IP 地址用来进行网络层寻址；端口参与传输层端点的区分。应用不应把一个 socket 的一次 recv 当作一条完整应用消息，TCP 没有保留消息边界。']],
 '分层是理解职责的模型，不意味着所有协议都严格只属于一种教科书分类。示例字符串仅用于演示。','每次包装复制已有字符串；本例层数固定，成本与总报文长度成正比。',
 String.raw`#include <iostream>
#include <string>
std::string wrap(const std::string& layer, const std::string& data) {
    return layer+"["+data+"]";
}
int main() {
    std::string data="hello";
    for(const std::string layer:{"HTTP","TCP","IP","Ethernet"}) data=wrap(layer,data);
    std::cout<<data;
}`, `def wrap(layer, data):
    return f"{layer}[{data}]"

data = "hello"
for layer in ["HTTP", "TCP", "IP", "Ethernet"]:
    data = wrap(layer, data)
print(data)`, 'Ethernet[IP[TCP[HTTP[hello]]]]',
 ['IP 在此四层模型中属于哪一层？',['应用层','传输层','网络层','链路层'],2,'IP 提供网络层寻址与分组交付。'],
 ['接收 Ethernet[IP[TCP[HTTP[data]]]] 时，先解析哪个最外层？',['HTTP','TCP','IP','Ethernet'],3,'解封装从最外层开始，再逐层向应用传递。'],
 '用 wrap(layer,data) 模拟封装 hello，依次加上 HTTP、TCP、IP、Ethernet 四层，输出完整嵌套字符串。明确这不是实际报文编码。');
lesson('subnet','net','IPv4 与子网掩码','位运算 · 前缀 · 网络地址','网络基础',22,
 [['32 位地址的两部分','IPv4 地址由 32 位组成，点分十进制把每 8 位写成一个数。/24 表示前 24 位是网络前缀，后 8 位属于该前缀内的地址空间。'],['按位与得到网络地址','网络地址 = IP & 掩码。192.168.1.130/26 的掩码是 255.255.255.192；最后一段 130 与 192 按位与得到 128。'],['地址数量不等于主机数量','/p 包含 2^(32-p) 个地址。传统普通子网常扣除网络地址和广播地址，但 /31 点到点链路与 /32 主机路由有特殊用途，不能盲目套用减二公式。']],
 'C++ 对 32 位整数移位 32 位是未定义行为，所以 /0 必须单独处理。示例固定合法 IPv4 输入。','固定 32 位运算为 O(1) 时间与空间。',
 String.raw`#include <iostream>
#include <cstdint>
int main() {
    uint32_t ip=(uint32_t(192)<<24)|(uint32_t(168)<<16)|(uint32_t(1)<<8)|130u;
    unsigned prefix=26;
    if(prefix>32) return 1;
    uint32_t mask=prefix==0 ? 0u : uint32_t(0xffffffffu << (32-prefix));
    uint32_t net=ip&mask;
    std::cout<<((net>>24)&255)<<'.'<<((net>>16)&255)<<'.'<<((net>>8)&255)<<'.'<<(net&255);
}`, `def network_address(octets, prefix):
    if len(octets) != 4 or any(not 0 <= x <= 255 for x in octets):
        raise ValueError('invalid IPv4')
    if not 0 <= prefix <= 32:
        raise ValueError('invalid prefix')
    ip = 0
    for x in octets:
        ip = (ip << 8) | x
    mask = (0xffffffff << (32-prefix)) & 0xffffffff
    net = ip & mask
    return '.'.join(str((net >> s) & 255) for s in (24,16,8,0))

print(network_address([192,168,1,130], 26))`, '192.168.1.128',
 ['IPv4 地址总共有多少位？',['16','32','64','128'],1,'IPv4 为 32 位，IPv6 为 128 位。'],
 ['192.168.1.130/26 的网络地址是？',['192.168.1.0','192.168.1.64','192.168.1.128','192.168.1.192'],2,'/26 每个块包含 64 个地址，130 位于 128—191 这一块。'],
 '用位运算求 192.168.1.130/26 的网络地址，输出 192.168.1.128。再用 /0、/32 验证移位边界，分别应得到 0.0.0.0 和原地址。');
lesson('tcp','net','TCP 序列号与确认','字节流 · 累计确认 · 握手','传输与应用',22,
 [['可靠的是有序字节流','TCP 用序列号标记字节位置，通过确认与重传处理丢失，并提供流量与拥塞控制。应用仍需自己定义消息边界，例如长度前缀或分隔符。'],['ACK 表示下一个期待字节','在没有缺口的简化场景中，起始序列号 1000 的 100 字节数据覆盖 1000—1099，接收者确认 1100。确认不是“最后收到的字节编号”。'],['SYN 和 FIN 也占一个编号','SYN 和 FIN 各消耗一个序列号。本节只计算连续接收后的下一个编号，按 2^32 取模，不模拟乱序、窗口、重传或完整状态机。']],
 '不要把 TCP 的可靠性等同于应用事务成功。连接断开时，应用可能仍无法确定对方是否已处理某条业务请求。','固定宽度整数运算 O(1)；示例不是完整 TCP 实现。',
 String.raw`#include <iostream>
#include <cstdint>
uint32_t next_ack(uint32_t seq, uint32_t bytes, bool syn, bool fin) {
    return seq+bytes+uint32_t(syn)+uint32_t(fin);
}
int main() {
    std::cout<<next_ack(1000,0,true,false)<<'\n';
    std::cout<<next_ack(1001,100,false,false);
}`, `def next_ack(seq, byte_count, syn=False, fin=False):
    return (seq + byte_count + int(syn) + int(fin)) % (2**32)

print(next_ack(1000, 0, syn=True))
print(next_ack(1001, 100))`, '1001\n1101',
 ['TCP 提供的是？',['保留边界的数据报','有序字节流','永不失败的业务调用','仅单向传输'],1,'TCP 是字节流，应用消息需要自行分帧。'],
 ['连续收到 seq=20、长度 5 的数据（无 SYN/FIN），下一个 ACK 是？',['20','24','25','26'],2,'覆盖序列号 20 至 24，接下来期待 25。'],
 '实现简化 next_ack：序列号加字节数，再加 SYN/FIN 各占的 1。输入 SYN(seq=1000,length=0) 得 1001；随后数据(seq=1001,length=100) 得 1101，按 2^32 回绕。');
lesson('http','net','HTTP 请求与状态码','方法 · 路径 · 响应','传输与应用',20,
 [['请求表达意图','HTTP 请求包含方法、目标、头部及可选消息体。GET 用于读取资源，POST 请求目标资源处理提交的内容。HTTP/1.1 使用文本请求行，HTTP/2、HTTP/3 的线上表示不同。'],['状态码描述响应语义','2xx 表示成功，3xx 涉及重定向，4xx 表示客户端请求方面的问题，5xx 表示服务器方面的问题。404 表示未找到目标资源，不等于整个网络断开。'],['实践：解析一行请求','将 GET /learn?topic=stl HTTP/1.1 拆成方法、目标和版本，再在第一个 ? 处分离路径与查询字符串。这是请求行练习，不是能处理真实恶意流量的 HTTP 解析器。']],
 'HTTPS 在 HTTP 通信中加入 TLS 安全保护；不要把“HTTP 无状态”误解为服务端永远不保存会话。','O(n) 时间与空间，n 是请求行长度。',
 String.raw`#include <iostream>
#include <sstream>
#include <string>
int main() {
    std::istringstream in("GET /learn?topic=stl HTTP/1.1");
    std::string method,target,version,extra;
    if(!(in>>method>>target>>version) || (in>>extra) || version!="HTTP/1.1") return 1;
    auto pos=target.find('?');
    std::cout<<method<<'\n'<<target.substr(0,pos)<<'\n';
    std::cout<<(pos==std::string::npos ? "" : target.substr(pos+1));
}`, `line = 'GET /learn?topic=stl HTTP/1.1'
parts = line.split()
if len(parts) != 3 or parts[2] != 'HTTP/1.1':
    raise ValueError('invalid request line')
method, target, version = parts
path, _, query = target.partition('?')
print(method)
print(path)
print(query)`, 'GET\n/learn\ntopic=stl',
 ['HTTP 404 通常表示什么？',['请求成功','永久重定向','未找到目标资源','服务器内部错误'],2,'状态码 404 属于 4xx，通常表示找不到目标资源。'],
 ['请求目标 /learn?topic=stl 中的路径是？',['/learn','topic=stl','/learn?topic=stl','stl'],0,'? 之前为路径，之后为查询字符串。'],
 '解析 HTTP/1.1 请求行 GET /learn?topic=stl HTTP/1.1，分别输出方法 GET、路径 /learn、查询 topic=stl。若没有 ?，查询字符串应为空。');
lesson('lexer','compiler','词法分析：识别 Token','字符流 · 最长匹配 · 分类','编译前端',24,
 [['先把字符变成词','词法分析将字符序列转成 token 序列，如标识符、数字和运算符。token 一般包含类别与原始文本，完整工具还会记录行列位置以便报错。'],['连续读取同一类字符','本节只支持非负十进制整数、加号和空白。遇到数字要继续扫描整个数字串，而不是把 123 拆成三个 token。'],['遇到不认识的符号就报告','不要静默丢弃非法字符。本例的 12 + 34 会产生 NUM:12、PLUS:+、NUM:34。更完整的语言需要关键字、字符串、注释和多字符运算符规则。']],
 'C++ 的字符分类函数应接收可表示为 unsigned char 的值，避免负 char 值导致未定义行为。本例显式转换。','O(n) 时间，O(n) 输出空间。',
 String.raw`#include <iostream>
#include <string>
#include <cctype>
#include <stdexcept>
int main() {
    std::string s="12 + 34";
    for(size_t i=0;i<s.size();) {
        unsigned char c=static_cast<unsigned char>(s[i]);
        if(std::isspace(c)) { ++i; continue; }
        if(std::isdigit(c)) {
            size_t start=i;
            while(i<s.size() && std::isdigit(static_cast<unsigned char>(s[i]))) ++i;
            std::cout<<"NUM:"<<s.substr(start,i-start)<<'\n';
        } else if(s[i]=='+') { std::cout<<"PLUS:+\n"; ++i; }
        else throw std::runtime_error("invalid character");
    }
}`, `s = '12 + 34'
i = 0
while i < len(s):
    if s[i].isspace():
        i += 1
    elif '0' <= s[i] <= '9':
        start = i
        while i < len(s) and '0' <= s[i] <= '9':
            i += 1
        print('NUM:' + s[start:i])
    elif s[i] == '+':
        print('PLUS:+')
        i += 1
    else:
        raise ValueError('invalid character')`, 'NUM:12\nPLUS:+\nNUM:34',
 ['词法分析的直接输出一般是什么？',['机器码','Token 序列','最短路径','查询执行计划'],1,'词法分析把字符流转换成有类别的词法单元。'],
 ['在本节规则下，12+34 有几个 Token？',['2','3','4','5'],1,'数字 12、加号、数字 34，共三个。'],
 '实现只识别非负整数、+ 和空白的扫描器。输入 12 + 34，输出 NUM:12、PLUS:+、NUM:34；遇到 @ 必须报错。');
lesson('parser','compiler','递归下降语法分析','文法 · 非终结符 · 递归','编译前端',26,
 [['文法约束 Token 的组合','词法分析认识单词，语法分析检查组合。本节文法 S → (S)S | ε 能描述任意正确配对的圆括号串，例如 ()() 和 (())。ε 表示空串。'],['为非终结符写一个函数','parseS 看到左括号，就消费它，递归解析内部的 S，要求一个右括号，再解析后续 S。没看到左括号时按 ε 返回，交给调用者处理接下来的输入。'],['结束时必须消费全部输入','仅有某一段能被解析不代表整个输入合法。顶层完成后还需检查位置等于字符串长度，防止忽略多余的右括号或其他字符。']],
 '该文法已避免直接左递归。将 S→S... 原样翻译成递归函数会无限递归；长输入还可能触发调用栈限制。','O(n) 时间，O(n) 最坏递归空间。',
 String.raw`#include <iostream>
#include <string>
bool parseS(const std::string& s, size_t& i) {
    if(i<s.size() && s[i]=='(') {
        ++i;
        if(!parseS(s,i) || i==s.size() || s[i]!=')') return false;
        ++i;
        return parseS(s,i);
    }
    return true;
}
bool valid(const std::string& s) {
    size_t i=0; return parseS(s,i) && i==s.size();
}
int main() { std::cout<<std::boolalpha<<valid("(()())"); }`,
 `def valid(s):
    i = 0
    def parse_s():
        nonlocal i
        if i < len(s) and s[i] == '(':
            i += 1
            if not parse_s() or i == len(s) or s[i] != ')':
                return False
            i += 1
            return parse_s()
        return True
    return parse_s() and i == len(s)

print(str(valid('(()())')).lower())`, 'true',
 ['文法中的 ε 通常表示？',['语法错误','空串','结束括号','变量名'],1,'ε 允许该非终结符生成零个字符。'],
 ['为何顶层解析后还要检查 i==输入长度？',['加快内存分配','防止只解析合法前缀','保证升序','删除空格'],1,'例如输入 ()) 可先解析 ()，但剩余 ) 必须导致整个输入不合法。'],
 '按 S → (S)S | ε 实现递归下降识别器。(()()) 与空串合法；(()、())、a 不合法。函数应检查完整输入，不能只接受合法前缀。');
lesson('expression','compiler','表达式与运算符优先级','语法层级 · 乘法 · 加法','表达式与优化',28,
 [['用文法表达优先级','设 expr → term (+ term)*，term → number (* number)*。expr 调用 term，使乘法在加法之前归约，因此 2+3*4 得到 14。'],['循环表达左结合','每读到同层运算符，就把当前结果和右侧项合并。完整表达式语言还需要括号、一元运算、错误定位、类型规则等，本例只处理 +、* 与非负整数。'],['从求值走向语法树','此例直接计算结果；将数值替换成节点，就可构造 AST。AST 用结构保留优先级，不必保留每个括号与空白字符。']],
 '示例仅适用于小整数，C++ 使用 long long，超出范围需另加溢出检测。空白只在词法单元间跳过，不能把 1 2 合成 12。','O(n) 时间，除输入外 O(1) 额外空间；此简化文法无括号递归。',
 String.raw`#include <iostream>
#include <string>
#include <cctype>
#include <stdexcept>
class Parser {
    std::string s; size_t i=0;
    void spaces(){while(i<s.size() && std::isspace(static_cast<unsigned char>(s[i]))) ++i;}
    bool take(char c){spaces(); if(i<s.size() && s[i]==c){++i;return true;}return false;}
    long long number(){
        spaces(); long long x=0; size_t start=i;
        while(i<s.size() && s[i]>='0' && s[i]<='9') x=x*10+(s[i++]-'0');
        if(i==start) throw std::runtime_error("expected number"); return x;
    }
    long long term(){long long x=number(); while(take('*')) x*=number(); return x;}
public:
    explicit Parser(std::string text):s(text){}
    long long run(){long long x=term(); while(take('+')) x+=term(); spaces();
        if(i!=s.size()) throw std::runtime_error("unexpected token"); return x;}
};
int main(){std::cout<<Parser("2 + 3 * 4").run();}`, `def evaluate(s):
    i = 0
    def spaces():
        nonlocal i
        while i < len(s) and s[i].isspace():
            i += 1
    def take(c):
        nonlocal i
        spaces()
        if i < len(s) and s[i] == c:
            i += 1
            return True
        return False
    def number():
        nonlocal i
        spaces()
        start = i
        while i < len(s) and '0' <= s[i] <= '9':
            i += 1
        if start == i:
            raise ValueError('expected number')
        return int(s[start:i])
    def term():
        x = number()
        while take('*'):
            x *= number()
        return x
    x = term()
    while take('+'):
        x += term()
    spaces()
    if i != len(s):
        raise ValueError('unexpected token')
    return x

print(evaluate('2 + 3 * 4'))`, '14',
 ['在通常算术优先级下，2+3*4 的值是？',['20','14','24','9'],1,'先计算 3*4，再加 2。'],
 ['expr 调用 term，term 内处理乘法，主要目的是？',['让加法先计算','使乘法比加法优先','跳过所有数字','减少 Token 数'],1,'低优先级层把高优先级表达式作为自己的操作数。'],
 '实现非负小整数的 +、* 表达式求值，支持空白，2 + 3 * 4 输出 14；1 2 必须报错，不允许使用 eval。此节不要求括号和负号。');
lesson('constant-fold','compiler','常量折叠与 AST','语法树 · 后序遍历 · 优化','表达式与优化',24,
 [['编译时就能算的部分','如果一个运算节点的两边都是常量，且运算语义允许，就可以提前算出结果。例如 2+(3*4) 可以逐层折叠成 14。'],['先处理子树','用后序遍历先折叠左右孩子，再看当前节点是否变成两个常量。遇到变量或有副作用的操作时，不能仅凭表面形式删除求值。'],['优化必须保留语义','真实编译器需要考虑整数位宽、溢出、浮点舍入和异常。本节只有小整数常量和 +、*，不包含变量、函数调用或浮点数。']],
 '浮点数不总满足代数中的结合律。x*0 也不一定可以无条件消除 x 的求值，因为 x 可能含有副作用。','O(n) 时间，O(h) 递归栈；n 为 AST 节点数，h 为树高。',
 String.raw`#include <iostream>
#include <memory>
struct Node {
    char op; long long value;
    std::unique_ptr<Node> left,right;
};
std::unique_ptr<Node> num(long long x){return std::make_unique<Node>(Node{'n',x,nullptr,nullptr});}
std::unique_ptr<Node> binary(char op,std::unique_ptr<Node> a,std::unique_ptr<Node> b){
    return std::make_unique<Node>(Node{op,0,std::move(a),std::move(b)});
}
void fold(Node& n){
    if(n.op=='n') return;
    fold(*n.left); fold(*n.right);
    if(n.left->op=='n' && n.right->op=='n'){
        n.value=n.op=='+' ? n.left->value+n.right->value : n.left->value*n.right->value;
        n.op='n'; n.left.reset(); n.right.reset();
    }
}
int main(){auto tree=binary('+',num(2),binary('*',num(3),num(4)));fold(*tree);std::cout<<tree->value;}`, `def fold(node):
    if node[0] == 'num':
        return node
    op, left, right = node
    left, right = fold(left), fold(right)
    if left[0] == right[0] == 'num':
        a, b = left[1], right[1]
        return ('num', a+b if op == '+' else a*b)
    return (op, left, right)

tree = ('+', ('num', 2), ('*', ('num', 3), ('num', 4)))
print(fold(tree)[1])`, '14',
 ['常量折叠把哪些工作提前完成？',['网络传输','编译期可确定的常量计算','所有用户输入','所有数据库请求'],1,'只有静态可确定且保持语义的计算才能安全提前完成。'],
 ['对 2+(3*4) 的 AST 折叠时，先处理？',['最外层加法','乘法子树','直接删除左侧 2','不需要遍历'],1,'先把 3*4 折叠为 12，父节点才变成两个常量相加。'],
 '构造小整数 AST 2+(3*4)，用后序遍历把所有常量运算折叠为数值节点，最终输出 14。支持 + 和 *，不必处理变量或溢出。');
const REFERENCES = {
 stl:[['C++ 工作草案：容器库','https://eel.is/c++draft/containers'],['Python：数据结构','https://docs.python.org/3/tutorial/datastructures.html']],
 ds:[['Python：collections.deque','https://docs.python.org/3/library/collections.html#collections.deque']],
 algo:[['Python：bisect','https://docs.python.org/3/library/bisect.html']],
 sql:[['MySQL 8.4：事务语句','https://dev.mysql.com/doc/refman/8.4/en/commit.html'],['Connector/C++：JDBC 示例','https://dev.mysql.com/doc/connector-cpp/9.0/en/connector-cpp-examples-complete-example-1.html'],['Connector/Python：execute','https://dev.mysql.com/doc/connector-python/en/connector-python-api-mysqlcursor-execute.html']],
 net:[['RFC 9293：TCP','https://www.rfc-editor.org/rfc/rfc9293.html'],['RFC 9110：HTTP 语义','https://www.rfc-editor.org/rfc/rfc9110.html']],
 compiler:[['LLVM 教程：Parser 与 AST','https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/LangImpl02.html']]
};

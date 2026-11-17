(() => {
const cite=(title,url,extra={})=>Object.assign(LESSONS.at(-1),{sources:[[title,url]],outputTestable:true,...extra});
lesson('algo-lca','algo','倍增与最近公共祖先 LCA','树上查询 · 二进制跳跃 · 路径距离','进阶图与代数算法',32,
 [['把逐步上跳变成二进制跳跃','up[k][v] 表示节点 v 的第 2^k 个祖先。利用 up[k][v]=up[k-1][up[k-1][v]] 预处理，把沿父指针走很远的问题拆成少数次跳跃。根的祖先约定为根自己。'],['先对齐深度，再同步上跳','查询两个节点时，先将较深者提升到相同深度。若尚未相遇，从最大的跳跃级别向下尝试；只在两个祖先不相同时一起上跳。最终两个节点的父亲就是 LCA。'],['从祖先扩展到距离','无权树中，distance(u,v)=depth[u]+depth[v]-2*depth[LCA(u,v)]。该公式依赖树上路径唯一；普通有环图不能直接套用。示例假设输入是根为 0 的有效树。']],
 '不要在深度未对齐时直接同步跳。若森林中的两个节点不连通，需要先识别所属连通分量，本例不处理这种查询。','预处理 O(n log n) 时间和空间；每次 LCA 查询 O(log n)。',
 String.raw`#include <iostream>
#include <vector>
#include <queue>
#include <algorithm>
int main(){
    std::vector<int> parent{0,0,0,1,1,2,2};
    int n=parent.size(),LOG=1;while((1<<LOG)<=n)++LOG;
    std::vector<std::vector<int>> child(n),up(LOG,std::vector<int>(n));
    std::vector<int> depth(n);
    for(int v=1;v<n;++v)child[parent[v]].push_back(v);
    std::queue<int> q;q.push(0);
    while(!q.empty()){int u=q.front();q.pop();for(int v:child[u]){depth[v]=depth[u]+1;q.push(v);}}
    up[0]=parent;
    for(int k=1;k<LOG;++k)for(int v=0;v<n;++v)up[k][v]=up[k-1][up[k-1][v]];
    auto lca=[&](int a,int b){
        if(depth[a]<depth[b])std::swap(a,b);
        int diff=depth[a]-depth[b];
        for(int k=0;k<LOG;++k)if(diff&(1<<k))a=up[k][a];
        if(a==b)return a;
        for(int k=LOG-1;k>=0;--k)if(up[k][a]!=up[k][b]){a=up[k][a];b=up[k][b];}
        return up[0][a];
    };
    std::cout<<lca(3,4)<<'\n'<<lca(3,5);
}`,String.raw`from collections import deque
parent = [0,0,0,1,1,2,2]
n = len(parent)
child, depth = [[] for _ in parent], [0]*n
for v in range(1,n):
    child[parent[v]].append(v)
q = deque([0])
while q:
    u = q.popleft()
    for v in child[u]:
        depth[v] = depth[u]+1
        q.append(v)
up = [parent[:]]
for k in range(1,n.bit_length()):
    up.append([up[-1][up[-1][v]] for v in range(n)])
def lca(a,b):
    if depth[a] < depth[b]: a,b = b,a
    diff = depth[a]-depth[b]
    for k in range(len(up)):
        if diff & (1<<k): a = up[k][a]
    if a == b: return a
    for k in range(len(up)-1,-1,-1):
        if up[k][a] != up[k][b]: a,b = up[k][a],up[k][b]
    return up[0][a]
print(lca(3,4))
print(lca(3,5))`, '1\n0',
 ['up[3][v] 通常表示哪个祖先？',['第 3 个','第 6 个','第 8 个','第 9 个'],2,'倍增表第 k 层对应 2^k 次父指针跳跃。'],
 ['depth[u]=4、depth[v]=3、depth[LCA]=1 时，树上距离是多少？',['2','5','7','8'],1,'距离为 4+3-2*1=5。'],
 '父数组 [0,0,0,1,1,2,2] 表示根为 0 的树。构建倍增表，分别查询 LCA(3,4) 和 LCA(3,5)，输出 1 和 0；不要每次逐个向上走完全部高度。');
cite('CMU 15-295：LCA 与 binary lifting','https://www.contest.cs.cmu.edu/295/s20/tutorials/lca.mark');

lesson('algo-astar','algo','A* 启发式最短路','g+h · 可采纳启发式 · 一致性','进阶图与代数算法',32,
 [['用估计引导探索','Dijkstra 按已走距离 g 排序，A* 按 f=g+h 排序，h 估计从当前节点到目标还需多少代价。本节四方向单位代价格子使用曼哈顿距离，不会高估真实绕障距离。'],['启发式要遵守条件','可采纳性要求 h 不高估到目标的最优代价；一致性进一步要求相邻节点满足 h(u)≤cost(u,v)+h(v)。本例满足一致性，h(goal)=0，目标以当前最优记录出队时可结束。'],['维护真实距离与过期记录','堆中的优先级只是引导，更新依据仍是更小的 g。一个节点可能有旧条目留在堆中，所以出队后核对 g 是否仍等于记录。示例只求路径长度，不输出完整路径。']],
 '如果允许对角线移动、不同代价或传送边，曼哈顿距离未必仍满足需要的条件。不要把贪心“只看 h”误写成 A*。','本例一致启发式网格中为 O(V log V) 量级、O(V) 空间；A* 一般性能取决于图和启发式，不保证比 Dijkstra 快。',
 String.raw`#include <iostream>
#include <vector>
#include <queue>
#include <tuple>
#include <functional>
#include <cstdlib>
int main(){
    std::vector<std::vector<int>> a{{0,0,0},{0,1,0},{0,0,0}};
    int R=a.size(),C=a[0].size();
    std::vector<std::vector<int>> d(R,std::vector<int>(C,1000000));
    auto h=[&](int r,int c){return std::abs(R-1-r)+std::abs(C-1-c);};
    using Item=std::tuple<int,int,int,int>;
    std::priority_queue<Item,std::vector<Item>,std::greater<Item>> q;
    d[0][0]=0;q.emplace(h(0,0),0,0,0);
    int dr[]{1,-1,0,0},dc[]{0,0,1,-1};
    while(!q.empty()){
        auto [f,g,r,c]=q.top();q.pop();(void)f;
        if(g!=d[r][c])continue;
        if(r==R-1&&c==C-1){std::cout<<g;return 0;}
        for(int k=0;k<4;++k){int nr=r+dr[k],nc=c+dc[k];
            if(nr<0||nr>=R||nc<0||nc>=C||a[nr][nc])continue;
            if(g+1<d[nr][nc]){d[nr][nc]=g+1;q.emplace(g+1+h(nr,nc),g+1,nr,nc);}
        }
    }
    std::cout<<-1;
}`,String.raw`import heapq
a = [[0,0,0],[0,1,0],[0,0,0]]
R,C = len(a),len(a[0])
def h(r,c): return abs(R-1-r)+abs(C-1-c)
d = [[float('inf')]*C for _ in range(R)]
d[0][0] = 0
q,answer = [(h(0,0),0,0,0)],-1
while q:
    f,g,r,c = heapq.heappop(q)
    if g != d[r][c]: continue
    if (r,c) == (R-1,C-1):
        answer = g
        break
    for dr,dc in [(1,0),(-1,0),(0,1),(0,-1)]:
        nr,nc = r+dr,c+dc
        if 0 <= nr < R and 0 <= nc < C and not a[nr][nc] and g+1 < d[nr][nc]:
            d[nr][nc] = g+1
            heapq.heappush(q,(g+1+h(nr,nc),g+1,nr,nc))
print(answer)`, '4',
 ['A* 通常用哪个优先级扩展节点？',['只看 h','g+h','节点编号','g-h'],1,'g 表示已走代价，h 提供剩余代价估计。'],
 ['四方向每步代价 1 的网格，从 (0,0) 到 (2,2) 的曼哈顿启发值为？',['2','3','4','8'],2,'两个坐标差绝对值之和为 2+2=4。障碍只可能增加绕行代价。'],
 '在 [[0,0,0],[0,1,0],[0,0,0]] 中，0 可通行、1 为障碍，四方向每步代价 1。使用 A* 求左上到右下的最短长度，输出 4。起点和终点保证可通行。');
cite('Hart、Nilsson、Raphael：A* 原始论文','https://ai.stanford.edu/~nilsson/OnlinePubs-Nils/PublishedPapers/astar.pdf');

lesson('algo-fft','algo','FFT 与多项式卷积','系数表示 · 点值表示 · 分治变换','进阶图与代数算法',38,
 [['把乘法转换到点值空间','多项式直接乘法需要对每对系数相乘。若先在足够多的点上求值，乘积在每个点上的值就是两个值相乘；之后再还原系数。FFT 利用单位根结构加速这些变换。'],['奇偶拆分形成递归','把系数拆成偶数项与奇数项，分别计算长度一半的变换，再通过单位根合并。填充长度为不小于结果长度的 2 的幂，避免卷积在长度边界循环折叠。'],['逆变换与数值误差','逆变换使用相反符号，并最终除以长度。本例处理较小整数系数，四舍五入恢复结果；浮点 FFT 不是任意大整数的精确乘法，必要时使用 NTT 或更严格的误差控制。']],
 '两个长度分别为 a、b 的系数序列，结果长度是 a+b-1。只填充到 max(a,b) 会得到错误的循环卷积。','补零后长度 N，时间 O(N log N)，峰值额外空间 O(N)。',
 String.raw`#include <iostream>
#include <vector>
#include <complex>
#include <cmath>
using C=std::complex<double>;
std::vector<C> fft(const std::vector<C>& a,int sign){
    int n=a.size();if(n==1)return a;
    std::vector<C> even,odd;
    for(int i=0;i<n;i+=2){even.push_back(a[i]);odd.push_back(a[i+1]);}
    auto e=fft(even,sign),o=fft(odd,sign);std::vector<C> r(n);
    C w=1,step=std::polar(1.0,sign*2*std::acos(-1.0)/n);
    for(int k=0;k<n/2;++k){r[k]=e[k]+w*o[k];r[k+n/2]=e[k]-w*o[k];w*=step;}
    return r;
}
int main(){
    std::vector<C>a{1,2},b{3,4};int need=a.size()+b.size()-1,n=1;
    while(n<need)n*=2;a.resize(n);b.resize(n);
    auto x=fft(a,1),y=fft(b,1);for(int i=0;i<n;++i)x[i]*=y[i];
    auto r=fft(x,-1);for(int i=0;i<need;++i)std::cout<<std::llround(r[i].real()/n)<<' ';
}`,String.raw`import cmath
def fft(a, sign):
    n = len(a)
    if n == 1: return a[:]
    even,odd = fft(a[::2],sign),fft(a[1::2],sign)
    result = [0j]*n
    w,step = 1,cmath.exp(sign*2j*cmath.pi/n)
    for k in range(n//2):
        result[k],result[k+n//2] = even[k]+w*odd[k],even[k]-w*odd[k]
        w *= step
    return result
a,b = [1,2],[3,4]
need,n = len(a)+len(b)-1,1
while n < need: n *= 2
x,y = fft(a+[0]*(n-len(a)),1),fft(b+[0]*(n-len(b)),1)
result = fft([u*v for u,v in zip(x,y)],-1)
print(*(round(z.real/n) for z in result[:need]))`, '3 10 8',
 ['长度 3 和 4 的多项式系数序列相乘，结果长度为？',['4','5','6','12'],2,'最高次数相加，系数个数为 3+4-1=6。'],
 ['FFT 逆变换在本节约定下，除更改符号外还需要？',['结果除以 N','全部系数取负','丢弃奇数项','再排序'],0,'正反变换组合会带来 N 倍系数，必须归一化。'],
 '用 FFT 计算 (1+2x)(3+4x) 的系数，输出 3 10 8。先补零至长度 4，点值相乘后做逆变换并归一化。');
cite('MIT 6.046：FFT 分治专题','https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/pages/calendar/');
lesson('net-smtp','net','邮件系统与 SMTP 多行响应','SMTP · POP3/IMAP · 响应终止','应用层与网络服务',25,
 [['发送与读取使用不同角色','SMTP 负责邮件提交和服务器间传递，POP3、IMAP 面向邮箱访问。邮件信封中的收发地址与邮件正文里的 From/To 头部并非同一个概念，转发和退信不能只按显示头部猜测。'],['一条响应可能跨多行','SMTP 响应以三位状态码开头。多行响应的中间行使用状态码后加连字符，最后一行使用状态码后加空格。读取到换行不一定意味着整个响应已经结束。'],['实现一个有边界的解析器','本例只解析给定完整字节串中的一条格式受限响应，核对每行状态码一致并找到结束标记，不连接服务器、也不发送邮件。真实客户端还需增量收包、超时、长度限制和 TLS 等机制。']],
 '不要仅检查第一行是否以 250 开头就立即发送下一命令。2xx、4xx、5xx 的语义不同；最终是否投递成功也不能只根据最初握手判断。','O(n) 时间，n 为响应文本长度；示例读入文本占 O(n) 空间。',
 String.raw`#include <iostream>
#include <sstream>
#include <string>
#include <cctype>
#include <stdexcept>
int main(){
    std::istringstream input("250-atlas.example\r\n250-PIPELINING\r\n250 SIZE 2048\r\n");
    std::string line,code;int count=0;bool finished=false;
    while(std::getline(input,line)){
        if(!line.empty()&&line.back()=='\r')line.pop_back();
        if(line.size()<4)throw std::runtime_error("short reply");
        for(int i=0;i<3;++i)if(!std::isdigit(static_cast<unsigned char>(line[i])))throw std::runtime_error("code");
        if(code.empty())code=line.substr(0,3);
        if(line.substr(0,3)!=code)throw std::runtime_error("mismatched code");
        ++count;
        if(line[3]==' '){finished=true;break;}
        if(line[3]!='-')throw std::runtime_error("separator");
    }
    if(!finished)throw std::runtime_error("incomplete");
    std::cout<<code<<' '<<count;
}`,String.raw`text = '250-atlas.example\r\n250-PIPELINING\r\n250 SIZE 2048\r\n'
code,count,finished = None,0,False
for line in text.splitlines():
    if len(line) < 4 or not all('0' <= c <= '9' for c in line[:3]):
        raise ValueError('invalid reply')
    code = code or line[:3]
    if code != line[:3]: raise ValueError('mismatched code')
    count += 1
    if line[3] == ' ':
        finished = True
        break
    if line[3] != '-': raise ValueError('separator')
if not finished: raise ValueError('incomplete')
print(code,count)`, '250 3',
 ['SMTP 主要承担哪项职责？',['查询网页缓存','邮件提交和传递','分配 IP 地址','链路错误检测'],1,'邮箱访问通常由 POP3 或 IMAP 等协议承担。'],
 ['多行响应中 250- 后还有内容，而 250 空格常表示什么？',['同一响应结束行','请求全部失败','传输层断开','开始一个 JSON 文档'],0,'状态码后的分隔符区分继续行与结束行。'],
 '解析三行响应 250-atlas.example、250-PIPELINING、250 SIZE 2048，输出状态码与行数 250 3。只有连字符行而没有终止行时应报告响应不完整。');
cite('RFC 5321：SMTP 响应','https://www.rfc-editor.org/rfc/rfc5321.html',{codeKind:'simulation'});

lesson('net-wireless','net','无线网络与隐藏终端','共享介质 · CSMA/CA · RTS/CTS','链路层与局域网',26,
 [['发送端听不到，不代表接收端空闲','隐藏终端的典型场景是 A、C 都能到达 B，却无法彼此听见。两者分别侦听都认为信道空闲，同时发送时仍可能在 B 处冲突。无线介质中的冲突判断不能只看发送端局部视角。'],['避免冲突与检测冲突不同','802.11 的竞争机制结合物理/虚拟载波侦听、随机退避、确认等手段。RTS/CTS 可在适合的场景帮助预约介质，但有开销，也不是所有碰撞都能彻底消除。'],['用覆盖图识别隐藏关系','本例将可互相听见简化成无向图。对每个接收者，枚举其邻居对；如果两个发送者之间没有边，就找到一组潜在隐藏终端。它不模拟实际射频、功率、抓包或完整 Wi-Fi MAC。']],
 '现实无线可达性可能不对称，干扰范围也不等于解码范围。本例无向覆盖图只是帮助理解隐藏终端的教学假设。','n 个节点的邻接矩阵枚举 O(n³) 时间，O(n²) 存储；可用邻接表按邻居数量优化。',
 String.raw`#include <iostream>
#include <vector>
int main(){
    std::vector<std::vector<int>> hear{{0,1,0},{1,0,1},{0,1,0}};
    int n=hear.size();
    for(int receiver=0;receiver<n;++receiver)
        for(int a=0;a<n;++a)for(int c=a+1;c<n;++c)
            if(hear[a][receiver]&&hear[c][receiver]&&!hear[a][c])
                std::cout<<char('A'+a)<<' '<<char('A'+c)<<" -> "<<char('A'+receiver);
}`,String.raw`hear = [[0,1,0],[1,0,1],[0,1,0]]
n = len(hear)
for receiver in range(n):
    for a in range(n):
        for c in range(a+1,n):
            if hear[a][receiver] and hear[c][receiver] and not hear[a][c]:
                print(chr(65+a),chr(65+c),'->',chr(65+receiver))`, 'A C -> B',
 ['隐藏终端 A、C 的关键特征是？',['彼此能听见但都听不到 B','都能到 B，却互相听不到','三者完全没有连接','必须使用同一个 IP'],1,'冲突发生在共同接收者处，发送端可能无法感知另一方。'],
 ['对 A—B—C 的线形覆盖图，哪组是潜在隐藏终端？',['A 与 B，相对 C','B 与 C，相对 A','A 与 C，相对 B','没有隐藏终端'],2,'A、C 都邻接 B，但二者互不邻接。'],
 '给定覆盖矩阵 [[0,1,0],[1,0,1],[0,1,0]]，枚举共同接收者和互不可闻的发送者对，输出 A C -> B；不要把结果硬编码。');
cite('CMU 15-441：无线网络与隐藏终端','https://www.cs.cmu.edu/afs/cs/academic/class/15441-s06/lectures/L18_Wireless.pdf',{codeKind:'simulation'});

lesson('compiler-error-recovery','compiler','语法错误恢复与同步点','Panic mode · 诊断 · 继续分析','语法分析',27,
 [['报告多个错误，比首错即停更有用','编译器发现错误后，不一定立即放弃整份文件。它可以记录诊断，跳过损坏的局部，再尝试处理后续语句，让用户一次修复多个独立问题。'],['同步点提供重新开始的位置','简化的 panic-mode 恢复会扫描到分号或闭括号等边界。同步规则必须与文法相关，否则可能跳过过多有效输入，或在同一个位置反复报错而无法前进。'],['不要把错误伪装成正确程序','错误节点应由后续阶段特殊处理，不能悄悄替换成合法值。本例语言只有“小非负整数 + 小非负整数;”语句，逐个分号分隔并严格检查；坏语句输出 ERROR，随后继续。']],
 '文本中的分号未必都是语句边界，例如字符串或注释内也可能出现。本例没有字符串、注释或嵌套语句，因此可以直接使用分号作为同步点。','示例扫描 O(n)，对每段做简单格式识别；正则实现的具体常数和内部复杂度由库决定。',
 String.raw`#include <iostream>
#include <sstream>
#include <string>
#include <regex>
int main(){
    std::istringstream source("1+2;bad;4+5;");std::string stmt;
    std::regex grammar(R"(\s*([0-9]+)\s*\+\s*([0-9]+)\s*)");
    while(std::getline(source,stmt,';')){
        std::smatch match;
        if(std::regex_match(stmt,match,grammar))
            std::cout<<std::stoi(match[1])+std::stoi(match[2])<<'\n';
        else std::cout<<"ERROR\n";
    }
}`,String.raw`import re
source = '1+2;bad;4+5;'
statements = source.split(';')
if statements[-1] == '': statements.pop()
for stmt in statements:
    match = re.fullmatch(r'\s*([0-9]+)\s*\+\s*([0-9]+)\s*',stmt)
    if match:
        print(int(match[1])+int(match[2]))
    else:
        print('ERROR')`, '3\nERROR\n9',
 ['Panic-mode 恢复通常会做什么？',['假装错误不存在','扫描到同步点后继续分析','把所有 Token 排序','删除整个源文件'],1,'以局部丢弃输入换取继续处理后续结构的机会。'],
 ['如果恢复过程既不消费 Token 也不结束，可能发生什么？',['编译自然完成','同一位置无限报错或死循环','自动修复所有语法','产生最优机器码'],1,'恢复必须保证前进或退出，避免重复落在相同错误状态。'],
 '解析由分号分隔的小整数加法语句。输入 1+2;bad;4+5;，依次输出 3、ERROR、9。坏语句不能阻止之后的有效语句被处理。');
cite('Cornell CS4120：语法分析与错误恢复','https://courses.cs.cornell.edu/courses/cs4120/2026sp/notes/');
})();

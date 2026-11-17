/* 协议机制教学模型，不访问网络，不代替完整协议实现。 */
(()=>{
function add(id,title,group,sections,pit,cost,c,p,out,q1,q2,task,rfc){
 const cpp='#include <iostream>\n#include <vector>\n#include <string>\n#include <map>\n#include <set>\n#include <algorithm>\nusing namespace std;\n'+c;
 lesson(id,'net',title,sections.map(x=>x[0]).join(' · '),group,25,sections,pit,cost,cpp,p,out,q1,q2,task);
 Object.assign(LESSONS.at(-1),{sources:[['协议标准与机制参考',rfc]],cppStandard:'C++17',codeKind:'simulation',outputTestable:true});
}
add('net-congestion','流量控制、拥塞窗口与 AIMD','传输层与可靠通信',
 [['两个窗口解决不同问题','接收窗口 rwnd 表示接收端可接受的数据量，拥塞窗口 cwnd 反映发送端对网络承载能力的估计。允许的在途数据通常同时受两者限制，不能把流量控制等同于拥塞控制。'],['慢启动与拥塞避免','经典 TCP 通过确认反馈增加发送量，通过丢包等信号降低发送量。慢启动与拥塞避免的增长规律不同；现代系统还可能采用 CUBIC、BBR 等算法，本例只展示整数化 AIMD。'],['按轮计算剩余发送额度','本例把单位设为一个 MSS，每个无拥塞轮令 cwnd 加1，丢包轮减半且不低于1。给定事件 ok、ok、loss、ok，初值4得到5、6、3、4；另用 min(cwnd,rwnd)-flight 计算非负发送额度。']],
 '真实 TCP 按 ACK、字节和恢复状态更新，不能把本例的按轮加1直接当成完整 TCP 实现。',
 '处理 n 个事件 O(n) 时间、O(1) 状态；实际吞吐还受 RTT、丢包与应用供数限制。',
 String.raw`int main(){int cwnd=4;for(string e:vector<string>{"ok","ok","loss","ok"}){cwnd=e=="loss"?max(1,cwnd/2):cwnd+1;cout<<cwnd<<' ';}cout<<'\n'<<max(0,min(cwnd,3)-2);}`,
 `cwnd=4
values=[]
for e in ['ok','ok','loss','ok']:
    cwnd=max(1,cwnd//2) if e=='loss' else cwnd+1
    values.append(cwnd)
print(*values)
print(max(0,min(cwnd,3)-2))`,'5 6 3 4\n1',
 ['rwnd 主要保护什么？',['接收端缓冲','DNS缓存','路由表','证书'],0,'接收窗口约束接收端可容纳的未读数据。'],['cwnd=4、rwnd=3、flight=2，剩余额度为？',['1','2','3','4'],0,'min(4,3)-2=1。'],
 '实现本节按轮AIMD模型并打印窗口序列，再计算接收窗口3、在途2时的发送额度1。','https://www.rfc-editor.org/rfc/rfc5681.html');
add('net-tcp-lifecycle','TCP 建连、关闭与 TIME-WAIT','传输层与可靠通信',
 [['建连同步双方状态','三次握手让双方交换初始序列号并确认对方的发送能力。SYN 和 FIN 各占一个序列号，确认号表示期待的下一个序列位置；同时打开等情况需要更完整的状态机。'],['关闭是两个方向分别结束','主动关闭发送 FIN 后等待确认，对端仍可发送数据；对端再发 FIN 时需要确认。TIME-WAIT 有助于处理最后确认丢失及旧报文寿命，不能简单理解为程序忘记释放连接。'],['有限事件路径模型','本例只模拟主动打开与主动关闭的正常路径：SYN-SENT、ESTABLISHED、FIN-WAIT-1、FIN-WAIT-2、TIME-WAIT、CLOSED。非法事件报告 INVALID 且保留当前状态，不处理重传、同时关闭与复位。']],
 '一次 recv 返回0通常表示对端有序关闭发送方向，不表示历史上接收的数据可以忽略。TIME-WAIT 时长取决于协议与实现配置。',
 '有限状态表每个事件常数时间，n 个事件 O(n)。',
 String.raw`int main(){map<pair<string,string>,string>t={{{"CLOSED","open"},"SYN-SENT"},{{"SYN-SENT","synack"},"ESTABLISHED"},{{"ESTABLISHED","close"},"FIN-WAIT-1"},{{"FIN-WAIT-1","ack"},"FIN-WAIT-2"},{{"FIN-WAIT-2","fin"},"TIME-WAIT"},{{"TIME-WAIT","timeout"},"CLOSED"}};string s="CLOSED";for(string e:vector<string>{"open","synack","close","ack","fin","timeout"}){auto it=t.find({s,e});if(it==t.end())cout<<"INVALID\n";else{s=it->second;cout<<s<<'\n';}}}`,
 `transitions={('CLOSED','open'):'SYN-SENT',('SYN-SENT','synack'):'ESTABLISHED',('ESTABLISHED','close'):'FIN-WAIT-1',('FIN-WAIT-1','ack'):'FIN-WAIT-2',('FIN-WAIT-2','fin'):'TIME-WAIT',('TIME-WAIT','timeout'):'CLOSED'}
s='CLOSED'
for e in ['open','synack','close','ack','fin','timeout']:
    if (s,e) not in transitions: print('INVALID')
    else:
        s=transitions[s,e]
        print(s)`,'SYN-SENT\nESTABLISHED\nFIN-WAIT-1\nFIN-WAIT-2\nTIME-WAIT\nCLOSED',
 ['FIN 是否占用序列号？',['是','否','仅携带数据才占','仅UDP占'],0,'FIN 是需要确认的控制信息，占一个序列号。'],['主动关闭的FIN已确认但未收到对方FIN，对应本例哪一状态？',['LISTEN','FIN-WAIT-2','CLOSED','SYN-SENT'],1,'本端发送方向已结束，仍等待对端关闭。'],
 '用状态转移表模拟给定六个事件，输出本节六个状态；未知事件输出INVALID且不改变状态。','https://www.rfc-editor.org/rfc/rfc9293.html');
add('net-framing','Socket、字节流与消息边界','传输层与可靠通信',
 [['系统调用不保留应用写入边界','TCP 提供有序字节流，一次 send 不保证对应一次 recv。发送与接收都可能只完成部分数据，程序需维护剩余字节，并区分关闭、暂不可用与真正错误。'],['用协议定义帧','常见策略有固定长度、分隔符和长度前缀。本例使用一个字节作为负载长度，最大255字节；真实服务需限制帧大小，避免等待恶意超长消息而耗尽内存。'],['增量解析半包与多帧','把输入片段追加到缓冲，只有长度前缀和全部负载到齐才交付消息；否则保存未完成部分。示例分三次喂入两帧，输出hi和cat，展示网络分片不改变消息含义。']],
 '本例是内存中的帧解析器，没有创建socket。生产事件循环还需处理短写、超时、背压和连接关闭时未完成的帧。',
 '教学实现删除缓冲前缀可能搬移数据，最坏可达平方成本；生产实现可用读指针或环形缓冲。',
 String.raw`int main(){vector<vector<unsigned char>>chunks={{2,'h'},{'i',3,'c'},{'a','t'}};vector<unsigned char>b;for(auto chunk:chunks){b.insert(b.end(),chunk.begin(),chunk.end());while(!b.empty()&&b.size()>=size_t(b[0])+1){size_t n=b[0];cout<<string(b.begin()+1,b.begin()+1+n)<<'\n';b.erase(b.begin(),b.begin()+1+n);}}}`,
 `buffer=bytearray()
for chunk in [bytes([2])+b'h',b'i'+bytes([3])+b'c',b'at']:
    buffer.extend(chunk)
    while buffer and len(buffer)>=buffer[0]+1:
        n=buffer[0]
        print(buffer[1:n+1].decode('ascii'))
        del buffer[:n+1]`,'hi\ncat',
 ['一次recv一定对应一次send吗？',['一定','不一定','只在本机一定','只要很短就一定'],1,'TCP不保留应用层消息边界。'],['已收到长度5但仅有3字节负载应？',['立即交付','等待剩余负载','当成长度3','删除全部连接状态'],1,'长度前缀协议要等完整负载。'],
 '按本节一个字节长度前缀协议增量解析三段输入，输出hi和cat；保留尚未收齐的帧。','https://www.rfc-editor.org/rfc/rfc9293.html');
add('net-dns','DNS 解析、记录与 TTL 缓存','应用层与网络服务',
 [['从名称找到服务','DNS 的分层命名空间由根、顶级域和各区域的权威服务器协作。递归解析器替客户端完成查询，迭代应答则可能返回下一步该询问的服务器。'],['区分记录与传输','A/AAAA 对应地址，CNAME 表示别名，MX 指向邮件服务。DNS 常使用 UDP，也需要支持 TCP；加密传输与 DNSSEC 的数据真实性验证解决不同问题。'],['缓存有明确有效期','本例只实现A记录的本地TTL缓存：在时间100写入TTL30，时间129命中，130过期。缓存键应包含名称、类型等信息，生产解析器还需处理别名链、负缓存与响应验证。']],
 'TTL到期不是权威记录被删除，而是缓存应重新获取。示例时钟为可控整数，不使用真实网络。',
 '有序map查找O(log n)；Python字典平均O(1)。过期清理策略会影响缓存空间。',
 String.raw`int main(){map<string,pair<string,int>>cache;cache["example.test A"]={"192.0.2.7",130};for(int now:{129,130}){auto it=cache.find("example.test A");cout<<(it!=cache.end()&&now<it->second.second?it->second.first:"MISS")<<'\n';}}`,
 `cache={'example.test A':('192.0.2.7',100+30)}
for now in [129,130]:
    value,expiry=cache['example.test A']
    print(value if now<expiry else 'MISS')`,'192.0.2.7\nMISS',
 ['AAAA记录主要保存什么？',['IPv6地址','MAC地址','TCP窗口','证书私钥'],0,'AAAA用于IPv6地址记录。'],['100写入TTL30，130时能继续当新鲜缓存使用吗？',['能','不能','取决于域名长度','一直有效'],1,'有效区间在本模型中为[100,130)。'],
 '实现本节TTL缓存判断，查询129与130两个时间点，分别输出地址和MISS。','https://www.rfc-editor.org/rfc/rfc1035.html');
add('net-http-cache','HTTP 缓存、条件请求与版本演进','应用层与网络服务',
 [['语义与承载方式分开','HTTP方法、状态码与资源语义不只属于某个传输版本。HTTP/1.1、HTTP/2、HTTP/3的消息承载不同；HTTP/2复用流仍可能受TCP丢包影响，HTTP/3使用QUIC。'],['新鲜度和再验证','max-age规定新鲜度期限；缓存过期后可用ETag与If-None-Match进行条件请求。资源未变时304允许复用已缓存实体；no-cache要求复用前验证，不等同于禁止存储。'],['限定条件的决策模型','本例只考虑可缓存GET响应、已计算好的age、无Vary或其他指令。age<max-age时命中；过期且标签相同则返回304；标签改变需要200及新实体。实际缓存决策要遵循更多请求和响应限制。']],
 '不能仅凭ETag就忽略no-store、private、Vary、鉴权与请求方法。304自身不携带新的完整响应实体。',
 '已取得元数据后，本例决策O(1)；实际缓存查找、对象传输与重新验证另计。',
 String.raw`string decide(int age,int maxAge,string stored,string current){if(age<maxAge)return "HIT";return stored==current?"304":"200";}int main(){cout<<decide(10,30,"v1","v1")<<'\n'<<decide(40,30,"v1","v1")<<'\n'<<decide(40,30,"v1","v2");}`,
 `def decide(age,max_age,stored,current):
    if age<max_age: return 'HIT'
    return '304' if stored==current else '200'
print(decide(10,30,'v1','v1'))
print(decide(40,30,'v1','v1'))
print(decide(40,30,'v1','v2'))`,'HIT\n304\n200',
 ['no-cache是否等同于完全禁止存储？',['是','否，它要求复用前验证','仅图片等同','会永久缓存'],1,'禁止存储使用no-store等语义，不能混淆。'],['过期缓存标签v1，服务器仍为v1，条件GET可能返回？',['304','301','404','500'],0,'验证未修改后可复用缓存实体。'],
 '在本节限定假设下实现新鲜度与ETag判断，三个测试分别输出HIT、304、200。','https://www.rfc-editor.org/rfc/rfc9111.html');
add('net-cookie','Cookie、会话与浏览器安全边界','应用层与网络服务',
 [['会话状态如何关联请求','服务器可以通过Set-Cookie要求浏览器保存状态标识，后续符合域名、路径和安全条件的请求携带Cookie。会话标识应不可预测，服务端仍需执行身份与权限检查。'],['不同属性各有职责','Secure限制安全传输，HttpOnly限制脚本读取，SameSite影响跨站发送条件。HttpOnly并不直接阻止浏览器发送Cookie，Cookie也不自动提供CSRF防护或完整访问授权。'],['只模拟精确主机的发送条件','本例限定host-only Cookie、无路径和SameSite判断，仅检查主机完全相同及Secure传输要求。example.test通过HTTPS发送，HTTP不发送，其他主机不发送；这不是浏览器完整Cookie实现。']],
 '不要用简单字符串后缀匹配模拟完整域匹配。演示不处理公共后缀、过期、路径或跨站上下文。',
 '单个Cookie精确主机比较O(m)，m为主机名长度。',
 String.raw`bool send(string host,bool https){return host=="example.test"&&https;}int main(){cout<<send("example.test",true)<<' '<<send("example.test",false)<<' '<<send("other.test",true);}`,
 `def send(host,https):
    return host=='example.test' and https
print(int(send('example.test',True)),int(send('example.test',False)),int(send('other.test',True)))`,'1 0 0',
 ['HttpOnly主要限制什么？',['JavaScript读取Cookie','所有HTTP请求','服务器权限校验','DNS解析'],0,'HttpOnly限制脚本访问，不代替服务端授权。'],['Secure Cookie向同主机HTTP请求发送吗？',['本模型不发送','总是发送','根据端口奇偶','仅首次发送'],0,'本模型要求安全传输。'],
 '实现限定host-only、Secure Cookie的发送判断，三个请求输出1 0 0；列举本模型未处理的条件。','https://www.rfc-editor.org/rfc/rfc6265.html');
add('net-tls','TLS、证书验证与加密连接','网络安全与性能',
 [['加密还需要认证','TLS同时关注机密性、完整性与对端认证。只加密而不验证对端身份，仍可能把数据交给中间人。实际程序应使用维护中的TLS库及正确的信任配置。'],['证书检查有多重条件','链到信任根、有效时间、主机名匹配等都是验证的一部分，还需结合算法、用途和策略。主机名验证与证书链签名验证不是同一件事。'],['只演示条件组合','本例把chain_ok视为外部验证器已给出的结果，使用整数时间和精确主机名判断。有效证书通过，主机不符或过期拒绝。代码没有解析证书、做密码运算或实现TLS握手。']],
 '不能把本例当成可部署的证书验证器；真实验证必须交给标准TLS库，且不要关闭验证来绕过连接错误。',
 '本模型只做布尔组合与字符串比较；真实证书链验证成本与链长、签名算法等有关。',
 String.raw`bool accept(bool chain,int now,string name){return chain&&100<=now&&now<=200&&name=="example.test";}int main(){cout<<accept(true,150,"example.test")<<' '<<accept(true,150,"other.test")<<' '<<accept(true,201,"example.test");}`,
 `def accept(chain,now,name):
    return chain and 100<=now<=200 and name=='example.test'
print(int(accept(True,150,'example.test')),int(accept(True,150,'other.test')),int(accept(True,201,'example.test')))`,'1 0 0',
 ['仅有加密但不验证服务端身份有什么缺口？',['可能连到冒充者','自动更安全','不需要证书','避免所有攻击'],0,'加密不能单独证明对端是谁。'],['链可信但主机名不匹配应？',['拒绝','忽略','修改本地时间','直接信任'],0,'主机名验证是独立必要条件。'],
 '组合给定链验证结果、有效期和精确主机名条件，输出三个案例1 0 0，明确这不是完整证书验证。','https://www.rfc-editor.org/rfc/rfc8446.html');
add('net-quic','QUIC、多流与连接迁移','传输层与可靠通信',
 [['在UDP之上实现可靠传输','QUIC集成安全握手与多流传输，使用连接标识帮助连接不完全依赖固定四元组。它仍需拥塞控制、流量控制与丢失恢复，不是因为UDP就可以忽略这些机制。'],['每条流各自维护顺序','同一可靠流内仍需按偏移重组。一个流缺少字节，不必像TCP单字节流那样阻塞其他流已经完整到达的数据；但连接级拥塞和资源限制仍会影响所有流。'],['模拟独立重组','本例在流0先收到偏移1的B，不能交付；流4收到偏移0的X可立即交付；之后流0收到A便交付AB。只处理单字符、不重叠片段，不包含QUIC包格式或加密。']],
 '“避免流之间的传输层队头阻塞”不代表每个流内无等待，也不代表网络丢包不影响吞吐。',
 '本例有序映射插入/删除O(log n)，每个字节最多交付一次；真实流使用区间管理而非逐字节节点。',
 String.raw`int main(){map<int,map<int,char>>buf;map<int,int>next;vector<vector<int>>events={{0,1,'B'},{4,0,'X'},{0,0,'A'}};for(auto e:events){int id=e[0];buf[id][e[1]]=char(e[2]);string ready;while(buf[id].count(next[id])){ready+=buf[id][next[id]];buf[id].erase(next[id]++);}if(!ready.empty())cout<<id<<' '<<ready<<'\n';}}`,
 `buf={}; offsets={}
for stream,pos,ch in [(0,1,'B'),(4,0,'X'),(0,0,'A')]:
    b=buf.setdefault(stream,{})
    offsets.setdefault(stream,0)
    b[pos]=ch
    ready=''
    while offsets[stream] in b:
        ready+=b.pop(offsets[stream])
        offsets[stream]+=1
    if ready: print(stream,ready)`,'4 X\n0 AB',
 ['QUIC可靠流内乱序字节可以直接全部交付吗？',['不能，仍需流内顺序','可以','只看UDP端口','必须等待其他所有流'],0,'每条流维护自身的有序字节序列。'],['流0缺字节，流4数据完整，本例会？',['先交付流4','阻塞整个连接所有流','删除流0','强制重建连接'],0,'独立重组允许流4继续交付。'],
 '实现两个流的独立单字符重组，按给定到达顺序输出4 X和0 AB。','https://www.rfc-editor.org/rfc/rfc9000.html');
add('net-proxy-cdn','代理、负载均衡与 CDN','应用层与网络服务',
 [['代理所在位置影响职责','正向代理代表客户端访问目标，反向代理位于服务端入口。反向代理可处理路由、TLS终止、缓存和负载均衡，但需要正确传递并验证来源信息。'],['CDN把内容靠近用户','边缘缓存可降低回源距离和源站压力，效果取决于缓存命中、调度与内容一致性。带用户身份的响应不能未经合适规则就共享缓存。'],['健康感知轮询模型','本例只有三个上游，其中B不健康，对健康列表A、C轮询，四次分配结果A C A C。健康探测、超时、重试、熔断和会话粘滞需要另行设计。']],
 '请求失败时重试可能重复执行非幂等操作；轮询也不等于按真实负载均衡。空健康列表必须明确失败，而不是对零取模。',
 '构建健康列表O(n)，之后每次选取O(1)，空间O(n)。',
 String.raw`int main(){vector<pair<string,bool>>nodes={{"A",true},{"B",false},{"C",true}};vector<string>healthy;for(auto n:nodes)if(n.second)healthy.push_back(n.first);if(healthy.empty()){cout<<"UNAVAILABLE";return 0;}for(int i=0;i<4;++i)cout<<healthy[i%healthy.size()]<<' ';}`,
 `nodes=[('A',True),('B',False),('C',True)]
healthy=[name for name,ok in nodes if ok]
print(' '.join(healthy[i%len(healthy)] for i in range(4)) if healthy else 'UNAVAILABLE')`,'A C A C',
 ['反向代理通常位于哪侧？',['服务端入口','仅用户键盘','CPU寄存器','数据库磁盘'],0,'它代表后端服务对外接受请求。'],['所有上游不健康，本例应？',['返回UNAVAILABLE','对0取模','无限重试','发给任意主机'],0,'明确失败使上层能处理不可用。'],
 '过滤不健康上游并对A、C轮询四次，输出A C A C；没有健康节点时输出UNAVAILABLE。','https://www.rfc-editor.org/rfc/rfc9110.html');
add('net-qos','令牌桶、限流与网络排障','网络安全与性能',
 [['速率和突发需要同时描述','令牌桶用容量限制可积攒的突发额度，按速率补充令牌。请求消耗令牌，不足时可拒绝或排队。本例选择拒绝，不模拟排队与包调度。'],['先定位瓶颈再调整','排障可以分别检查名称解析、路由可达、连接握手、TLS与应用响应。高延迟可能来自传播、排队或服务处理，单次ping也不能代表所有业务请求的表现。'],['可控时钟的请求序列','容量3、每秒补1、初始满桶。在同一时刻连续请求4次，前三次通过，第4次拒绝；一秒后再次通过。拒绝不消耗令牌，时间必须单调，长时间空闲最多补到容量。']],
 '按IP限流不等于按用户限流，共享出口可能影响多个用户。生产分布式限流还需处理并发原子性、时钟与多节点一致性。',
 '单桶每次请求O(1)时间和空间；按多个键限流时额外需要状态存储与清理。',
 String.raw`int main(){int tokens=3,last=0;for(int now:{0,0,0,0,1}){tokens=min(3,tokens+now-last);last=now;bool ok=tokens>=1;if(ok)--tokens;cout<<ok<<' ';}}`,
 `tokens,last=3,0
result=[]
for now in [0,0,0,0,1]:
    tokens=min(3,tokens+now-last)
    last=now
    ok=tokens>=1
    if ok: tokens-=1
    result.append(int(ok))
print(*result)`,'1 1 1 0 1',
 ['令牌桶容量主要控制什么？',['最大积攒突发额度','DNS记录类型','证书长度','TCP端口数'],0,'容量限制空闲期间可以积攒的令牌。'],['桶满为3，同秒4次每次耗1，能通过几次？',['1','2','3','4'],2,'没有经过时间补充，只有3个令牌。'],
 '按容量3、速率1/秒实现单桶，处理时间0、0、0、0、1的请求，输出1 1 1 0 1。','https://www.rfc-editor.org/rfc/rfc2697.html');
})();

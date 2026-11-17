/* 扩充课程：原创讲解与练习；来源用于核对范围和语义。 */
(() => {
const headers = ['iostream','vector','array','deque','list','forward_list','map','set','unordered_map','unordered_set','stack','queue','algorithm','iterator','numeric','functional','string','string_view','tuple','bitset','memory','limits','stdexcept','cmath'];
function add(x) {
 const cpp=headers.map(h=>'#include <'+h+'>').join('\n')+'\n'+(x.extra||'')+'\nusing namespace std;\n'+x.cpp;
 lesson(x.id,x.cat||'stl',x.title,x.sub,x.group,x.minutes||25,x.sections,x.pitfall,x.cost,cpp,x.py,x.out,x.q1,x.q2,x.task);
 Object.assign(LESSONS[LESSONS.length-1],{sources:[[x.sourceTitle||'C++ 标准草案：对应章节',x.source]],cppStandard:x.standard||'C++17',scope:x.scope||'核心'});
}
add({id:'stl-array',title:'array：固定长度的连续容器',sub:'静态长度 · 值语义 · 边界检查',group:'顺序容器',
 sections:[['长度也是类型的一部分','array<int,4> 的 4 在编译时确定，不能像 vector 一样追加元素。它包装固定大小的连续存储，支持迭代器、整体复制和比较。需要运行时决定大小时应考虑 vector。'],['下标与检查的取舍','operator[] 不检查越界，at() 在越界时抛出异常。空 array 合法，但不能取 front/back。元素的值初始化可用花括号，避免局部整数没有初始化。'],['实践：固定窗口汇总','建立长度为 4 的读数数组，逐个访问并计算总和。Python 使用列表表达同一操作，但列表并不具有 C++ array 的静态长度约束。']],
 pitfall:'不要把 array 的固定长度误认为元素不可修改；const 才约束修改。',cost:'随机访问 O(1)；遍历与整体复制 O(n)，存储 O(n)。',
 cpp:String.raw`int main(){ array<int,4> a{2,4,6,8}; a.at(1)=5; cout<<accumulate(a.begin(),a.end(),0); }`,py:`a = [2,4,6,8]
a[1] = 5
print(sum(a))`,out:'21',
 q1:['array<int,4> 的长度何时确定？',['运行时随元素增长','编译时','每次访问时','由最大元素决定'],1,'长度是模板参数，参与容器类型。'],q2:['[2,4,6,8] 的下标 1 改为 5 后，总和是？',['20','19','21','25'],2,'2+5+6+8=21。'],task:'创建固定长度 4 的读数容器 [2,4,6,8]，将下标 1 改为 5，遍历求和输出 21。C++ 使用 array 和 at。',source:'https://eel.is/c++draft/array'});
add({id:'stl-deque',title:'deque：两端增长的序列',sub:'双端插入 · 随机访问 · 分段存储',group:'顺序容器',
 sections:[['两端都需要高效更新','deque 支持头尾插入、删除与常数时间随机访问，适合两端变动的序列。它通常由多个存储块组成，不承诺所有元素像 vector 那样连续。'],['接口相似，保证不同','push_front/push_back 添加两端，front/back 读取两端，pop_front/pop_back 只移除。中间插入仍需要移动元素；不能将 &d[0] 当作整个序列的连续数组入口。'],['实践：双端调度','先安排 [2,3]，在头部加入紧急任务 1，在尾部加入普通任务 4，再移除已处理的头部。最后顺序是 [2,3,4]。Python collections.deque 没有 C++ deque 的 O(1) 中间索引保证。']],
 pitfall:'端部插入可能使迭代器失效；不要假定引用与迭代器具有相同失效规则。',cost:'C++ 单次端部操作和下标访问 O(1)；Python deque 两端操作 O(1)，中间索引 O(n)。',cpp:String.raw`int main(){ deque<int> d{2,3}; d.push_front(1);d.push_back(4);d.pop_front();for(int x:d)cout<<x<<' '; }`,py:`from collections import deque
d = deque([2,3])
d.appendleft(1)
d.append(4)
d.popleft()
print(*d)`,out:'2 3 4',
 q1:['deque 特别适合哪种操作组合？',['头尾频繁增删','只使用连续内存接口','任意位置 O(1) 插入','自动保持有序'],0,'deque 提供高效双端更新，但不保证整体连续。'],q2:['deque 是否保证全部元素连续存放？',['保证','只在空时保证','不保证','由元素值决定'],2,'标准并不提供 vector 那样的连续存储保证。'],task:'从 [2,3] 开始，头部加 1、尾部加 4，再删除头部，输出 2 3 4；两种语言都使用双端队列。',source:'https://eel.is/c++draft/deque'});
add({id:'stl-linked-containers',title:'list 与 forward_list：链式容器',sub:'节点链接 · splice · 前驱操作',group:'顺序容器',
 sections:[['双向与单向的区别','list 提供双向迭代，forward_list 只提供前向迭代。它们不支持下标随机访问；已知合适迭代器后，局部插入或删除可以只改链接。'],['单链表围绕前驱更新','forward_list 的 insert_after/erase_after 操作指定位置之后的节点，before_begin 表示头节点之前的位置。list 的 splice 可在兼容分配器条件下转移节点，通常不需要复制元素。'],['实践：移除相邻重复','两个容器都提供 unique，它仅压缩相邻相等值，并不会删除所有不相邻重复。本例的 1,1,2,2,1 会变为 1,2,1，保留尾部的 1。Python 以列表构建等价结果，不模拟节点稳定性。']],
 pitfall:'对 list 调用 std::sort 不成立，因为 std::sort 需要随机访问迭代器；应使用 list.sort。',cost:'unique 遍历 O(n)；已知位置的单节点增删 O(1)；位置查找 O(n)。',cpp:String.raw`int main(){ list<int> a{1,1,2,2,1}; a.unique(); for(int x:a)cout<<x<<' ';cout<<'\n';forward_list<int> b{1,1,2,2,1};b.unique();for(int x:b)cout<<x<<' '; }`,py:`a = [1,1,2,2,1]
def adjacent_unique(xs):
    out = []
    for x in xs:
        if not out or out[-1] != x:
            out.append(x)
    return out
print(*adjacent_unique(a))
print(*adjacent_unique(a))`,out:'1 2 1\n1 2 1',q1:['forward_list 的迭代器支持什么方向？',['仅向前','仅向后','随机跳转','自动排序'],0,'单链表的迭代器仅提供前向遍历。'],q2:['对 [1,1,2,1] 调用 unique 后是什么？',['[1,2]','[1,2,1]','[1,1,2]','[2,1]'],1,'unique 只删除相邻重复，不负责全局去重。'],task:'分别用 list 和 forward_list 压缩 [1,1,2,2,1] 的相邻重复，两行都输出 1 2 1。Python 实现等价压缩逻辑。',source:'https://eel.is/c++draft/sequences'});
add({id:'stl-map',title:'map：按键有序的映射',sub:'唯一键 · 有序遍历 · 区间查询',group:'关联容器',sections:[['有序关系来自比较器','map 保存唯一键值对，默认按键升序遍历。相比哈希映射，它支持有序范围操作，并保证对数级的查找、插入与删除，而不是平均常数时间。'],['更新值不等于修改键','map 中键不能通过迭代器直接修改，因为这会破坏顺序。值可以更新。operator[] 对缺失键插入默认值，find 和 at 则有不同的缺失键语义。'],['实践：按名称汇总','给出 pear、apple、pear，先计数再按键遍历，输出 apple:1 和 pear:2。Python dict 本身按插入顺序迭代，因此这里显式排序键以匹配任务。']],pitfall:'同一个比较器定义下互不小于的键视作等价；键的等价关系不一定是 operator==。',cost:'C++ 建表 O(n log k)、遍历 O(k)；Python 计数平均 O(n)，排序 O(k log k)。',cpp:String.raw`int main(){map<string,int> m;for(string x:{"pear","apple","pear"})++m[x];for(auto [k,v]:m)cout<<k<<':'<<v<<'\n';}`,py:`m = {}
for x in ['pear','apple','pear']:
    m[x] = m.get(x,0)+1
for k in sorted(m):
    print(f'{k}:{m[k]}')`,out:'apple:1\npear:2',q1:['map 默认遍历顺序由什么决定？',['插入时间','键的比较关系','值的大小','哈希值'],1,'map 的关联关系由键的比较器排序。'],q2:['读取缺失键 m["x"]（值类型 int）会怎样？',['只返回错误','不改变容器','插入 x 并值初始化为 0','随机返回'],2,'operator[] 会创建缺失键。'],task:'统计 pear、apple、pear 的次数，并按键升序输出 apple:1、pear:2。不要依赖 Python 字典的插入顺序。',source:'https://eel.is/c++draft/map'});
add({id:'stl-multi-associative',title:'multiset 与 multimap：重复键',sub:'多重集合 · equal_range · 删除粒度',group:'关联容器',sections:[['重复值是数据的一部分','multiset 允许多个等价元素，multimap 允许多个等价键与不同值共存。它们仍按比较关系有序，适合成绩排名、事件时间表和一对多映射。'],['equal_range 找到整组','equal_range(key) 返回 [first,last)，恰好覆盖全部等价键。遍历该区间可取出某个分类的全部记录，而 lower_bound 与 upper_bound 给出两端位置。'],['删除一个与删除全部','erase(key) 删除全部匹配元素；erase(iterator) 只删除该位置的一个。示例从 2,2,5 中仅删一个 2，剩余 2 的计数应为 1。']],pitfall:'multimap 没有 operator[]，因为一个键可能对应多个值，单值访问含义不明确。',cost:'定位范围 O(log n)，遍历 k 个匹配项 O(k)；计数通常 O(log n+k)。',cpp:String.raw`int main(){multiset<int> s{2,2,5};s.erase(s.find(2));cout<<s.count(2)<<'\n';multimap<string,int> m{{"A",1},{"B",9},{"A",3}};auto [a,b]=m.equal_range("A");for(auto i=a;i!=b;++i)cout<<i->second<<' ';}`,py:`from collections import Counter
s = Counter([2,2,5])
s[2] -= 1
print(s[2])
records = [('A',1),('B',9),('A',3)]
print(*(v for k,v in records if k == 'A'))`,out:'1\n1 3',q1:['multiset 与 set 的主要区别是？',['支持重复等价值','元素无序','不支持查询','只有字符串键'],0,'multiset 不要求键唯一。'],q2:['multiset {2,2,5} 执行 erase(2) 后还剩几个 2？',['0','1','2','取决于迭代顺序'],0,'按键删除会移除全部等价键。'],task:'从多重集合 [2,2,5] 仅删除一个 2，输出剩余计数 1；再输出 multimap 中键 A 对应的 1、3。',source:'https://eel.is/c++draft/associative'});
add({id:'stl-unordered-family',title:'unordered_set 与无序多重容器',sub:'哈希等价 · 负载因子 · 重复键',group:'关联容器',sections:[['四种哈希容器','unordered_set 保存唯一值，unordered_map 保存唯一键值对；unordered_multiset 和 unordered_multimap 允许重复。哈希函数与相等谓词必须一致：被判定相等的键必须具有相同哈希值。'],['桶与负载因子','load_factor 是元素数除以桶数。reserve 与 rehash 可调整容量策略，降低频繁扩容开销，但不会保证元素遍历顺序，也不能消除最坏冲突。'],['实践：区分存在性与次数','向无序集合加入 4,4,9 得到两个不同值；无序多重集合仍有两个 4。输出计数而不是直接遍历，避免让答案依赖实现特定顺序。']],pitfall:'rehash 会使迭代器失效；相同键的 hash 一致只是必要条件，冲突键仍需要相等比较。',cost:'常见查找平均 O(1)，最坏 O(n)；多重键匹配项还需 O(k) 处理。',cpp:String.raw`int main(){unordered_set<int> a{4,4,9};unordered_multiset<int>b{4,4,9};unordered_multimap<int,string>c{{4,"x"},{4,"y"}};cout<<a.size()<<' '<<b.count(4)<<' '<<c.count(4);}`,py:`from collections import Counter, defaultdict
values = [4,4,9]
a = set(values)
b = Counter(values)
c = defaultdict(list)
for k,v in [(4,'x'),(4,'y')]:
    c[k].append(v)
print(len(a), b[4], len(c[4]))`,out:'2 2 2',q1:['unordered_multiset 是否允许重复值？',['不允许','只允许一个 0','允许','取决于 Python 版本'],2,'multi 容器保存等价键的多次出现。'],q2:['若 equal(a,b) 为真，自定义 hash 必须满足？',['hash(a) 不等于 hash(b)','hash(a) 等于 hash(b)','a 与 b 地址相同','a 小于 b'],1,'相等对象必须落入相同哈希值对应的桶。'],task:'分别构造唯一无序集合、多重无序集合和多重无序映射，输出不同值数 2、值 4 的次数 2、键 4 的记录数 2。',source:'https://eel.is/c++draft/unord.req'});
add({id:'stl-stack-queue',title:'stack 与 queue：受限接口适配器',sub:'LIFO · FIFO · 底层容器',group:'容器适配器',sections:[['只暴露任务需要的操作','stack 与 queue 不自行定义全新存储布局，而是包装底层容器并限制接口。stack 使用 top，queue 使用 front/back，两者默认底层容器通常是 deque。'],['读取与移除分开','C++ 的 pop 返回 void，要先读取再弹出；二者都不提供直接 begin/end 遍历。空容器上读取元素不合法，应先检查 empty。'],['实践：同一输入两种顺序','依次加入 1、2、3，栈依次取出 3、2、1，队列取出 1、2、3。Python 列表可模拟栈，collections.deque 可模拟队列。']],pitfall:'不要用 list.pop(0) 作为高吞吐 Python 队列；它会移动后面的元素。',cost:'本示例每次入出 O(1)，整体 O(n) 时间、O(n) 存储。',cpp:String.raw`int main(){stack<int>s;queue<int>q;for(int x:{1,2,3}){s.push(x);q.push(x);}while(!s.empty()){cout<<s.top()<<' ';s.pop();}cout<<'\n';while(!q.empty()){cout<<q.front()<<' ';q.pop();}}`,py:`from collections import deque
s = [1,2,3]
q = deque(s)
while s:
    print(s.pop(), end=' ')
print()
while q:
    print(q.popleft(), end=' ')`,out:'3 2 1\n1 2 3',q1:['queue.front() 读取的是？',['最近加入的元素','最早尚未移除的元素','最大值','随机元素'],1,'队列是先进先出。'],q2:['C++ stack.pop() 的返回类型是？',['int','引用','void','迭代器'],2,'读取栈顶要使用 top，pop 只负责移除。'],task:'向栈和队列依次加入 1、2、3，分别输出完整移除顺序。访问元素前检查容器不为空。',source:'https://eel.is/c++draft/container.adaptors'});
add({id:'stl-iterator-categories',title:'迭代器类别与半开区间',sub:'输入输出 · 前向双向 · 随机访问',group:'迭代器与有效性',
sections:[['类别描述操作能力','输入迭代器用于读取，输出迭代器用于写入；前向支持多趟遍历，双向支持递减，随机访问支持常数时间跳转。连续迭代器还保证连续存储。算法会要求特定能力。'],['统一使用半开区间','[first,last) 包括 first，不包括 last。空区间满足 first==last；last 可比较但不可解引用。容器的 end 不是最后一个元素，而是末尾之后的位置。'],['同接口不等于同成本','advance 对 vector 迭代器可以直接跳转，对 list 迭代器需要逐节点行走。本例分别前进两步取出 30，再计算链表范围长度 4。']],
pitfall:'list 迭代器不支持 it+2；distance 对链式迭代器可能要遍历全部范围。',cost:'随机访问移动 O(1)，链式移动 k 步 O(k)。',cpp:String.raw`int main(){vector<int>a{10,20,30,40};list<int>b(a.begin(),a.end());auto x=a.begin();auto y=b.begin();advance(x,2);advance(y,2);cout<<*x<<' '<<*y<<' '<<distance(b.begin(),b.end());}`,
py:`a = [10,20,30,40]
it = iter(a)
next(it)
next(it)
print(a[2], next(it), len(a))`,out:'30 30 4',q1:['end 指向哪里？',['最后元素','最后元素之后','第一个元素','最大元素'],1,'end 是哨兵位置，不可解引用。'],q2:['list 迭代器前进 k 步一般需要？',['O(1)','O(log k)','O(k)','O(k²)'],2,'必须沿链接逐个前进。'],task:'分别将 vector 和 list [10,20,30,40] 的起始迭代器前进两步，输出 30 30，再输出区间长度 4。',source:'https://eel.is/c++draft/iterator.requirements'});
add({id:'stl-iterator-adapters',title:'迭代器适配器：反向与插入',sub:'reverse_iterator · back_inserter · 流迭代器',group:'迭代器与有效性',
sections:[['反向遍历的边界','rbegin 指向反向序列的第一个值，rend 表示反向末尾。reverse_iterator.base 指向正向序列中被访问元素的后一个位置，转换为正向删除位置时要注意偏移。'],['输出位置也可以是一种动作','back_inserter 将赋值转为 push_back；front_inserter 与 inserter 分别适配头部和指定位置插入。目标必须支持对应容器操作。'],['实践：反向复制到空容器','对 [1,2,3] 使用反向范围和尾插适配器得到 [3,2,1]。ostream_iterator 还能把算法输出接到流。Python 用 reversed 与 extend 实现同一任务。']],
pitfall:'向空 vector.begin 直接 copy 不会自动增长 size；需要 resize 或插入迭代器。',cost:'O(n) 时间和目标存储。',cpp:String.raw`int main(){vector<int>a{1,2,3},b;copy(a.rbegin(),a.rend(),back_inserter(b));copy(b.begin(),b.end(),ostream_iterator<int>(cout," "));}`,py:`a = [1,2,3]
b = []
b.extend(reversed(a))
print(*b)`,out:'3 2 1',q1:['back_inserter 将赋值适配为？',['pop_back','push_back','sort','clear'],1,'输出一个元素会在目标尾部追加。'],q2:['空 vector 只 reserve(3) 后直接 copy 到 begin 是否安全？',['安全','不安全，size 仍为 0','只对整数安全','取决于排序'],1,'容量不等于已构造元素数。'],task:'用反向与插入迭代器把 [1,2,3] 复制到空目标容器，输出 3 2 1。',source:'https://eel.is/c++draft/iterator.adaptors'});
add({id:'stl-iterator-invalidation',title:'迭代器失效与安全删除',sub:'erase 返回值 · 扩容 · 生命周期',group:'迭代器与有效性',
sections:[['迭代器依赖存储状态','vector 重分配使旧迭代器、指针和引用失效。vector.erase 使被删位置及之后的位置失效。节点容器和哈希容器有不同规则，不能套用一种容器的结论。'],['用 erase 返回的新位置','删除当前元素时写 it=erase(it)，不删除时才递增。循环每次重新比较当前 end，这样可正确处理连续多个待删除元素。'],['偶然正确仍可能无效','失效迭代器的错误常在扩容或内存布局变化后才暴露。实践删除 [1,2,4,3,6] 的偶数，连续的 2 和 4 都必须移除。']],
pitfall:'erase 后无条件再 ++it 会跳过元素，且可能操作无效位置。',cost:'逐项 vector.erase 最坏 O(n²)；批量 erase-remove 可做到 O(n)。',cpp:String.raw`int main(){vector<int>a{1,2,4,3,6};for(auto it=a.begin();it!=a.end();){if(*it%2==0)it=a.erase(it);else ++it;}for(int x:a)cout<<x<<' ';}`,py:`a = [1,2,4,3,6]
i = 0
while i < len(a):
    if a[i]%2 == 0:
        del a[i]
    else:
        i += 1
print(*a)`,out:'1 3',q1:['vector 重分配后旧迭代器如何？',['全部保持有效','仅 end 失效','全部失效','自动更新'],2,'底层存储已改变。'],q2:['循环删除后应如何得到下一位置？',['使用 erase 返回值','无条件再递增旧迭代器','保存原 end 永久使用','解引用已删除位置'],0,'容器返回新的有效后继或 end。'],task:'原地删除 [1,2,4,3,6] 中所有偶数，输出 1 3。演示逐项安全删除，并说明最坏平方复杂度。',source:'https://eel.is/c++draft/vector.modifiers'});
add({id:'stl-sorting',title:'排序算法：完整、稳定与局部排序',sub:'sort · stable_sort · nth_element',group:'算法库',
sections:[['只做需求所需的排序','sort 整理全部区间；partial_sort 只把前 k 个排好；nth_element 只保证第 k 位置与两侧分区，两边内部不保证有序。都要满足对应迭代器与比较器要求。'],['稳定性是明确保证','stable_sort 保留等价元素原相对顺序。按分数排序时，若同分仍需按登记顺序出现，就应选择稳定排序。Python sorted 本身稳定。'],['实践：保留同分登记顺序','Ana:80、Bo:70、Cy:80 升序排列应得到 Bo、Ana、Cy。比较器只比较分数，让稳定性负责 Ana 与 Cy 的次序。']],
pitfall:'不能根据 sort 某次结果推断它具有稳定性。',cost:'sort O(n log n) 比较；stable_sort 有足够缓冲区 O(n log n)，否则可为 O(n log²n)。',cpp:String.raw`int main(){vector<pair<string,int>>a{{"Ana",80},{"Bo",70},{"Cy",80}};stable_sort(a.begin(),a.end(),[](const auto&x,const auto&y){return x.second<y.second;});for(auto [name,score]:a)cout<<name<<' ';}`,py:`a = [('Ana',80),('Bo',70),('Cy',80)]
print(*(name for name,score in sorted(a,key=lambda x:x[1])))`,out:'Bo Ana Cy',q1:['保持同键元素原顺序应选择？',['stable_sort','任意 sort','reverse','unique'],0,'稳定性需要明确保证。'],q2:['nth_element 完成后两侧内部一定有序吗？',['都一定','只有左边','不保证','等同完整排序'],2,'只保证目标位置和分区关系。'],task:'将 Ana:80、Bo:70、Cy:80 按分数稳定升序排序，输出 Bo Ana Cy。',source:'https://eel.is/c++draft/alg.sorting'});
add({id:'stl-partition',title:'partition：按条件分组',sub:'稳定分区 · 分界点 · 谓词',group:'算法库',
sections:[['分区不是排序','partition 把满足谓词的元素移到前部，返回第一个不满足条件的位置。两组内部不一定有序，也不保证原相对顺序。'],['稳定分区保留组内次序','stable_partition 适合“优先处理一类任务，但保持各组到达顺序”。partition_point 可在已按同一谓词分区的范围内查找分界点。'],['实践：偶数先行','将 [3,2,4,1] 稳定分为偶数和奇数，结果是 [2,4,3,1]，分界位置下标 2。Python 用两次条件筛选拼接得到等价结果。']],
pitfall:'partition_point 的前提是已经分区，不是任意条件搜索的替代品。',cost:'partition 线性；稳定分区的比较为 O(n)，移动成本取决于可用缓冲区。',cpp:String.raw`int main(){vector<int>a{3,2,4,1};auto p=stable_partition(a.begin(),a.end(),[](int x){return x%2==0;});cout<<distance(a.begin(),p)<<'\n';for(int x:a)cout<<x<<' ';}`,py:`a = [3,2,4,1]
left = [x for x in a if x%2 == 0]
right = [x for x in a if x%2 != 0]
print(len(left))
print(*(left+right))`,out:'2\n2 4 3 1',q1:['partition 主要完成？',['全局升序','满足谓词者在前','删除重复','逆序'],1,'只按谓词真假分组。'],q2:['[3,2,4,1] 偶数优先的稳定分区是？',['4 2 1 3','2 4 3 1','1 2 3 4','3 1 2 4'],1,'两组分别保留原相对顺序。'],task:'输出 [3,2,4,1] 偶数优先稳定分区的分界下标 2，再输出 2 4 3 1。',source:'https://eel.is/c++draft/alg.partitions'});
add({id:'stl-query-algorithms',title:'find、count 与谓词查询',sub:'find_if · all_of · any_of · none_of',group:'算法库',
sections:[['让查询意图直接可读','find 查找指定值，find_if 查找首个满足条件者，count/count_if 统计出现次数。all_of、any_of、none_of 分别表达全部、至少一个和一个也没有。'],['理解空区间','空区间的 all_of 与 none_of 为真，any_of 为假。前者没有反例，后者没有满足条件的见证，符合逻辑中的全称和存在命题。'],['实践：监测值查询','对 [4,7,10,3] 找首个大于 5 的值并统计偶数数量，结果为 7 和 2。find_if 结果必须先和 end 比较，不能假设一定找到。']],
pitfall:'find 返回位置，不是布尔值；得到 end 后不得解引用。',cost:'最坏 O(n) 时间，O(1) 额外状态。',cpp:String.raw`int main(){vector<int>a{4,7,10,3};auto p=find_if(a.begin(),a.end(),[](int x){return x>5;});if(p!=a.end())cout<<*p;cout<<' '<<count_if(a.begin(),a.end(),[](int x){return x%2==0;});}`,py:`a = [4,7,10,3]
first = next((x for x in a if x>5),None)
print(first,sum(x%2 == 0 for x in a))`,out:'7 2',q1:['find_if 返回？',['首个匹配位置或 end','匹配总数','最后一个值','排序结果'],0,'返回可定位元素的迭代器。'],q2:['空区间的 all_of 为？',['假','真','抛异常','随机'],1,'不存在违反条件的元素。'],task:'对 [4,7,10,3] 输出首个大于 5 的值及偶数个数，结果为 7 2；说明无匹配时应如何检查。',source:'https://eel.is/c++draft/alg.nonmodifying'});
add({id:'stl-transform-copy',title:'transform、copy 与填充生成',sub:'逐项映射 · fill · generate',group:'算法库',
sections:[['复制、过滤与变换','copy 保留值，copy_if 带条件筛选，transform 将每个输入映射为新值。fill 写入固定值，generate 每次调用生成器产生新值。'],['输出范围必须合法','普通输出迭代器不会自动调整容器大小。可预先 resize，也可用 back_inserter。仅 reserve 不增加 size，无法提供可直接赋值的元素。'],['实践：生成平方序列','对 [-2,0,3] 逐项平方写到新容器，得到 [4,0,9]，原数组保持不变。示例只处理小整数，避免把溢出处理混入映射主题。']],
pitfall:'二元 transform 的第二输入也必须足够长，且输出重叠必须满足具体算法的前提。',cost:'n 次映射 O(n) 时间，独立结果 O(n) 空间。',cpp:String.raw`int main(){vector<int>a{-2,0,3},b;transform(a.begin(),a.end(),back_inserter(b),[](int x){return x*x;});for(int x:b)cout<<x<<' ';}`,py:`a = [-2,0,3]
b = [x*x for x in a]
print(*b)`,out:'4 0 9',q1:['transform 的用途是？',['逐项映射并输出','只判断存在','只删除','只能排序'],0,'算法将函数作用于输入元素。'],q2:['只 reserve 后目标 size 为？',['容量值','保持原值','总是 1','随机'],1,'reserve 只改变容量保证，不构造元素。'],task:'输入 [-2,0,3] 保持不变，生成平方序列 4 0 9；C++ 使用 transform 与尾插输出。',source:'https://eel.is/c++draft/alg.transform'});
add({id:'stl-erase-remove',title:'remove、unique 与逻辑尾部',sub:'擦除移除惯用法 · 去重 · C++20 erase_if',group:'算法库',
sections:[['算法移动元素，容器管理长度','remove_if 把要保留的元素向前压缩，返回新逻辑尾部，但并不改变容器 size。后面的值仍存在但不能再当作结果使用。'],['接上容器 erase','对 vector 使用 erase(remove_if(...),end()) 才真正缩短容器。unique 同样返回逻辑尾部，只处理相邻重复；全局去重常先排序再 unique。C++20 的 erase_if 封装了常见删除任务。'],['实践：排序去重','对 [3,1,3,2,1] 先排序，再 unique，再 erase，最后得到 [1,2,3]。这和保留首次出现顺序的去重需求不同。']],
pitfall:'忽略 unique 返回值会把逻辑结果之后的元素也打印出来。',cost:'排序 O(n log n)，压缩与 erase O(n)。',cpp:String.raw`int main(){vector<int>a{3,1,3,2,1};sort(a.begin(),a.end());a.erase(unique(a.begin(),a.end()),a.end());for(int x:a)cout<<x<<' ';}`,py:`a = [3,1,3,2,1]
a = sorted(set(a))
print(*a)`,out:'1 2 3',q1:['remove_if 会直接改变 vector.size 吗？',['会','不会','只删除一个','取决于值'],1,'算法只压缩元素并返回逻辑尾部。'],q2:['全局排序去重常见步骤是？',['unique 后直接遍历全部','sort→unique→erase','erase→sort→insert','reverse→count'],1,'先让相同值相邻，再压缩并缩短容器。'],task:'将 [3,1,3,2,1] 排序去重为 1 2 3，C++ 不允许只调用 unique 后打印原 size。',source:'https://eel.is/c++draft/alg.remove'});
add({id:'stl-bounds',title:'lower_bound、upper_bound 与 equal_range',sub:'有序边界 · 重复计数 · 插入位置',group:'算法库',
sections:[['三个边界语义','lower_bound 找首个不小于 x 的位置；upper_bound 找首个大于 x 的位置；equal_range 同时给出两者，形成全部等价元素的半开区间。'],['排序关系必须一致','查找时使用的比较关系要与构建有序范围时一致。对降序数据沿用升序查找前提会被破坏。返回 end 表示落在尾部边界，不是访问越界的许可。'],['实践：重复值所在区间','[1,2,2,2,4] 中值 2 的范围是下标 [1,4)，长度 3。C++ 用 equal_range，Python 用 bisect_left 与 bisect_right。']],
pitfall:'有序树容器优先使用成员 lower_bound；通用算法在非随机访问迭代器上可能有线性移动成本。',cost:'随机访问有序数组上 O(log n) 比较和时间；计数为边界差。',cpp:String.raw`int main(){vector<int>a{1,2,2,2,4};auto [l,r]=equal_range(a.begin(),a.end(),2);cout<<l-a.begin()<<' '<<r-a.begin()<<' '<<r-l;}`,py:`from bisect import bisect_left,bisect_right
a = [1,2,2,2,4]
l,r = bisect_left(a,2),bisect_right(a,2)
print(l,r,r-l)`,out:'1 4 3',q1:['upper_bound(x) 寻找什么？',['首个等于 x','首个大于 x','最后一个小于 x','任意相等值'],1,'upper 表示越过全部等价元素的右边界。'],q2:['[1,2,2,2,4] 中 2 的 equal_range 是？',['[1,3)','[1,4)','[0,4)','[2,4)'],1,'三个 2 占据下标 1、2、3。'],task:'输出 [1,2,2,2,4] 中数值 2 的左边界、右边界与数量，结果为 1 4 3。',source:'https://eel.is/c++draft/alg.binary.search'});
add({id:'stl-set-algorithms',title:'有序集合算法与 merge',sub:'交并差 · 对称差 · 合并',group:'算法库',
sections:[['算法作用于有序范围','set_union、set_intersection、set_difference、set_symmetric_difference 分别求并、交、差、对称差。输入可以是排序数组，不要求类型必须是 set。'],['重复值也有规则','这些算法按多重集合处理重复计数：交集取最小重数，并集取最大重数。merge 则保留两边全部元素，是加总重数，不能与 set_union 混淆。'],['实践：两个名单的交集','对已排序且唯一的 [1,3,5] 和 [3,4,5] 求交集，得到 [3,5]。输出插入迭代器负责增长目标，Python 显式排序交集得到相同顺序。']],
pitfall:'输入未按相同比较器排序时，不满足算法前提；集合差 A-B 与 B-A 通常不同。',cost:'两个长度 n、m 的有序输入，O(n+m) 时间和结果空间。',cpp:String.raw`int main(){vector<int>a{1,3,5},b{3,4,5},out;set_intersection(a.begin(),a.end(),b.begin(),b.end(),back_inserter(out));for(int x:out)cout<<x<<' ';}`,py:`a,b = [1,3,5],[3,4,5]
print(*sorted(set(a)&set(b)))`,out:'3 5',q1:['set_intersection 是否要求输入类型为 std::set？',['必须','不必，有序范围即可','只能 vector','只能数组指针'],1,'算法按迭代器范围工作。'],q2:['A 中两个 2，B 中三个 2，交集中有几个 2？',['1','2','3','5'],1,'多重集合交集取两边重数的最小值。'],task:'对 [1,3,5] 与 [3,4,5] 求有序交集并输出 3 5。说明若含重复值，Python set 版本与多重集合算法存在何种区别。',source:'https://eel.is/c++draft/alg.set.operations'});
add({id:'stl-heap-algorithms',title:'堆算法：管理已有容器',sub:'make_heap · push_heap · pop_heap · sort_heap',group:'算法库',
sections:[['堆并不一定封装在适配器里','make_heap 可把一个随机访问范围原地组织成堆。默认最大堆使最大值位于 front；底层数组并不是整体排序的。'],['扩展与删除是两步协议','push_back 新值后调用 push_heap；pop_heap 将堆顶交换到尾部并维护剩余范围，之后还需 pop_back 真正移除。只调用 pop_heap 不会减少 size。'],['实践：弹出最大值','把 [3,1,4] 建堆，追加 2 并调整，然后弹出最大值 4。对剩余堆 sort_heap 得到 [1,2,3]。Python 用负数维护最大堆语义。']],
pitfall:'所有堆操作必须使用一致比较器，sort_heap 的输入必须已经是相应的堆。',cost:'make_heap O(n)，单次 push/pop O(log n)，sort_heap O(n log n)。',cpp:String.raw`int main(){vector<int>a{3,1,4};make_heap(a.begin(),a.end());a.push_back(2);push_heap(a.begin(),a.end());pop_heap(a.begin(),a.end());cout<<a.back()<<'\n';a.pop_back();sort_heap(a.begin(),a.end());for(int x:a)cout<<x<<' ';}`,py:`import heapq
a = [-x for x in [3,1,4]]
heapq.heapify(a)
heapq.heappush(a,-2)
print(-heapq.heappop(a))
print(*sorted(-x for x in a))`,out:'4\n1 2 3',q1:['pop_heap 会自动减少容器 size 吗？',['会','不会','只对 vector 会','只移除最小值'],1,'它只调整范围，需要容器 pop_back。'],q2:['make_heap 的标准线性建堆复杂度是？',['O(1)','O(log n)','O(n)','O(n²)'],2,'自底向上调整总工作量为线性。'],task:'对 [3,1,4] 建最大堆、加入 2、弹出最大值 4，再排序剩余堆，输出第二行 1 2 3。',source:'https://eel.is/c++draft/alg.heap.operations'});
add({id:'stl-permutation',title:'排列、反转与旋转',sub:'next_permutation · reverse · rotate',group:'算法库',
sections:[['按字典序枚举排列','next_permutation 将序列变为下一字典序排列，若已经最大则恢复最小排列并返回 false。从有序序列开始可枚举所有不同排列，包括重复元素情况下的去重排列。'],['反转和旋转是不同操作','reverse 颠倒元素次序，rotate 把指定中点之前的一段移到末尾，并保留两段内部次序。它们是构建排列与序列重排的常用工具。'],['实践：重复元素排列','从 [1,1,2] 开始输出全部不同排列：112、121、211。Python itertools.permutations 会产生重复项，这里通过集合去重再排序匹配任务。']],
pitfall:'从非最小排列开始枚举，无法覆盖所有更小排列；Python 去重方案的内存成本也不同。',cost:'单次 next_permutation O(n)；全枚举随不同排列数增长，可能阶乘级。',cpp:String.raw`int main(){vector<int>a{1,1,2};do{for(int x:a)cout<<x;cout<<'\n';}while(next_permutation(a.begin(),a.end()));}`,py:`from itertools import permutations
for p in sorted(set(permutations([1,1,2]))):
    print(''.join(map(str,p)))`,out:'112\n121\n211',q1:['最大排列调用 next_permutation 后返回什么？',['true','false','抛异常','返回元素数'],1,'它恢复最小排列并返回 false。'],q2:['[1,1,2] 有几个不同排列？',['2','3','6','9'],1,'3!/2!=3。'],task:'按字典序枚举 [1,1,2] 的所有不同排列，输出 112、121、211。',source:'https://eel.is/c++draft/alg.permutation.generators'});
add({id:'stl-numeric',title:'数值算法：累积、扫描与差分',sub:'accumulate · partial_sum · inner_product',group:'算法库',
sections:[['累积的初值决定类型','accumulate 从初值开始按顺序累积，初值 0 表示 int，0LL 表示 long long。对大整数数组使用错误初值可能导致截断或溢出。'],['前缀和与相邻差分','partial_sum 输出每个位置之前的累积值，adjacent_difference 可恢复相邻增量。inner_product 逐对相乘再累加；iota 生成连续值。'],['实践：先扫描再求和','对 [2,3,5] 生成前缀和 [2,5,10]，最后总和为 10。C++ 使用 long long 初值，Python 整数可自动扩展，但仍有时间和存储成本。']],
pitfall:'reduce 可改变归约顺序；浮点加法不满足精确结合律，结果可能与顺序 accumulate 有差异。',cost:'扫描与累积 O(n) 时间，输出前缀数组 O(n) 空间。',cpp:String.raw`int main(){vector<int>a{2,3,5};vector<int>p(a.size());partial_sum(a.begin(),a.end(),p.begin());for(int x:p)cout<<x<<' ';cout<<'\n'<<accumulate(a.begin(),a.end(),0LL);}`,py:`from itertools import accumulate
a = [2,3,5]
print(*accumulate(a))
print(sum(a))`,out:'2 5 10\n10',q1:['accumulate 的累积结果类型主要由什么决定？',['最大元素','初值类型','容器名称','最后元素'],1,'初值类型决定内部累积器类型。'],q2:['[2,3,5] 的 partial_sum 是？',['2 3 5','2 5 10','0 2 5','10 8 5'],1,'依次累加得到 2、5、10。'],task:'输出 [2,3,5] 的前缀和及总和。C++ 总和使用 long long 初值，并解释与初值 0 的差异。',source:'https://eel.is/c++draft/numeric.ops'});
// 关联工具与现代接口
add({id:'stl-string',title:'string：字符串操作与边界',sub:'查找 · 子串 · 替换 · npos',group:'函数对象与关联工具',sections:[['字符串也是拥有存储的序列','string 保存字符并管理内存，size 是 char 元素数。在 UTF-8 中一个中文字符通常占多个字节，因此不能把字节下标当作 Unicode 字符下标。'],['查找结果需要检查','find 返回首次出现位置，失败返回 string::npos。substr(pos,count) 的第二参数是长度；replace 可替换指定区间。越界位置可能抛出异常。'],['实践：解析键值行','在 name=atlas 中寻找等号，再提取等号两侧。若等号缺失，先返回错误，避免拿 npos 继续计算下标。Python 的 find 失败是 -1，语义需要单独判断。']],pitfall:'npos 是无符号类型的最大值；不要用 pos >= 0 判断 C++ 查找成功。',cost:'示例线性查找 O(n)，子串复制总计 O(n) 空间。',cpp:String.raw`int main(){string s="name=atlas";auto p=s.find('=');if(p==string::npos){cout<<"invalid";return 0;}cout<<s.substr(0,p)<<' '<<s.substr(p+1);}`,py:`s = 'name=atlas'
p = s.find('=')
print('invalid' if p == -1 else s[:p] + ' ' + s[p+1:])`,out:'name atlas',q1:['string::find 未找到时返回？',['0','-1 的 int','string::npos','空字符串'],2,'返回 size_type 的特殊值 npos。'],q2:['s="abcdef"，s.substr(2,3) 是？',['cde','bc','cdef','abc'],0,'从下标 2 开始复制 3 个字符。'],task:'解析 name=atlas，输出 name atlas；没有等号时输出 invalid。',source:'https://eel.is/c++draft/basic.string'});
add({id:'stl-views',title:'string_view 与 span：借用连续数据',sub:'非拥有视图 · 生命周期 · 子区间',group:'现代标准扩展',standard:'C++20',extra:'#include <span>',sections:[['视图不负责管理所有者','string_view 借用字符序列；span<T> 借用连续的 T 序列。复制视图只复制地址和长度，不复制元素，底层对象必须比视图活得更久。'],['只读视图和只读元素不同','span<const int> 禁止通过视图改元素；const span<int> 固定视图本身，但仍可以修改元素。string_view 字符只读，却不保证末尾有空字符。'],['实践：修改数组中间区域','对 [1,2,3,4] 建立覆盖下标 1、2 的 span，把两个元素乘十，原数组变成 [1,20,30,4]。Python 的列表切片会复制，本例显式使用索引模拟借用更新。']],pitfall:'不要从局部 string 返回 string_view，也不要在 vector 扩容后使用旧 span。',cost:'建立子视图 O(1)，更新 k 个元素 O(k)，额外空间 O(1)。',cpp:String.raw`int main(){array<int,4>a{1,2,3,4};span<int> mid=span<int>(a).subspan(1,2);for(int&x:mid)x*=10;for(int x:a)cout<<x<<' ';}`,py:`a = [1,2,3,4]
for i in range(1,3):
    a[i] *= 10
print(*a)`,out:'1 20 30 4',q1:['span 是否拥有所指向的数据？',['总是拥有','不拥有','只有动态长度才拥有','由元素大小决定'],1,'span 是借用视图，需要外部保证生命周期。'],q2:['const span<int> 能否通过 operator[] 改元素？',['能','不能','只允许改第一个','必定抛异常'],0,'视图 const 不等于元素 const；只读元素用 span<const int>。'],task:'用 C++20 span 修改数组 [1,2,3,4] 的中间两个数为原值十倍；Python 用索引实现相同结果。',source:'https://eel.is/c++draft/views'});
add({id:'stl-tuple',title:'pair、tuple 与结构化绑定',sub:'组合返回值 · 解构 · 字典序',group:'函数对象与关联工具',sections:[['把相关结果作为一个值','pair 表达两个值，tuple 表达任意固定数量的异构值。它们适合短小的局部结果；含义复杂时，有命名字段的 struct 通常更易读。'],['按引用还是按值解构','auto [a,b]=p 复制成员；auto& [a,b]=p 引用成员。get<0> 按编译期索引访问，tie 可绑定已有变量或辅助多字段排序。'],['实践：返回最小值及位置','扫描 [9,2,7]，返回 pair<int,int>{2,1}。一次扫描同时获得两个相关结果，结构化绑定直接给结果命名。Python 使用元组解包完成相同任务。']],pitfall:'不要返回引用局部变量的 tuple；结构化绑定也必须遵守被引用对象的生命周期。',cost:'一次遍历 O(n)，额外空间 O(1)。',cpp:String.raw`pair<int,int> best(const vector<int>&a){if(a.empty())throw invalid_argument("empty");int p=0;for(int i=1;i<(int)a.size();++i)if(a[i]<a[p])p=i;return {a[p],p};}int main(){auto [value,index]=best({9,2,7});cout<<value<<' '<<index;}`,py:`def best(a):
    if not a: raise ValueError('empty')
    p = min(range(len(a)), key=lambda i: a[i])
    return a[p], p
value, index = best([9,2,7])
print(value, index)`,out:'2 1',q1:['修改结构化绑定以同时修改原 pair 应写？',['auto [a,b]','auto& [a,b]','const auto [a,b]','无需区分'],1,'引用绑定关联原成员。'],q2:['pair(2,9) 与 pair(3,1) 的字典序关系？',['前者更小','前者更大','相等','只比较第二项'],0,'先比较第一项，2 小于 3，第二项不参与。'],task:'扫描 [9,2,7]，通过组合返回值返回最小值及第一个最小值下标，输出 2 1；空输入明确报错。',source:'https://eel.is/c++draft/tuple'});
add({id:'stl-bitset',title:'bitset：固定大小的位集合',sub:'位运算 · 移位 · 集合模型',group:'函数对象与关联工具',sections:[['用一位表示一个状态','bitset<N> 的 N 是编译期常量，支持 set、reset、flip、test 和 count。右端字符对应第 0 位，通常让第 i 位表示编号 i 是否属于集合。'],['位操作对应集合操作','按位与求交集，按位或求并集，异或求仅出现一次的元素。移位用于移动状态位置，移出的位被丢弃。Python 整数位运算需显式掩码才能模拟固定宽度。'],['实践：两个课程集合求交','位串 00101101 与 00011100 的交集为 00001100，包含两个成员。直接用 count 得到交集大小，无需逐项存储布尔对象。']],pitfall:'bitset 的字符串打印顺序从高位到低位；整数转换也有目标类型宽度限制。',cost:'通常按机器字批量运算；N 位存储 O(N)，本例固定 8 位。',cpp:String.raw`int main(){bitset<8>a("00101101"),b("00011100");auto c=a&b;cout<<c<<' '<<c.count();}`,py:`a = int('00101101',2)
b = int('00011100',2)
c = (a & b) & 255
print(format(c,'08b'), c.bit_count())`,out:'00001100 2',q1:['bitset<8> 中字符串最右侧对应？',['第 7 位','第 0 位','任意位置','符号位'],1,'打印和字符串构造按高位到低位排列。'],q2:['按位与通常对应集合的什么操作？',['并集','差集','交集','笛卡尔积'],2,'只有两个集合都置位的位置才保留。'],task:'计算 8 位集合 00101101 和 00011100 的交集，打印 8 位结果及成员数量。',source:'https://eel.is/c++draft/template.bitset'});
add({id:'stl-comparator',title:'Lambda、函数对象与比较器契约',sub:'捕获 · 严格弱序 · 多字段排序',group:'函数对象与关联工具',sections:[['把小段行为传给算法','Lambda 可按值或按引用捕获局部变量。按值捕获保存创建时的值，按引用捕获依赖原变量的生命周期；函数对象通过 operator() 提供可调用行为。'],['比较器表达严格的先于关系','sort 的比较器需要严格弱序，尤其 cmp(x,x) 必须是 false。使用 <= 会破坏这一要求。按分数降序再按编号升序，可用两个不同字段逐层比较。'],['实践：成绩排序','记录 (编号,分数) 为 (2,90)、(1,90)、(3,80)，按分数降序且同分编号升序得到 1、2、3。Python key 为 (-分数,编号)，与 C++ 比较器表达相同规则。']],pitfall:'比较器不能在排序过程中随意改变排序标准；捕获悬空引用也会产生未定义行为。',cost:'排序 O(n log n) 比较；固定字段比较 O(1)。',cpp:String.raw`int main(){vector<pair<int,int>>a{{2,90},{1,90},{3,80}};sort(a.begin(),a.end(),[](const auto&x,const auto&y){return x.second!=y.second?x.second>y.second:x.first<y.first;});for(auto [id,score]:a)cout<<id<<' ';}`,py:`a = [(2,90),(1,90),(3,80)]
a.sort(key=lambda x: (-x[1],x[0]))
print(*(x[0] for x in a))`,out:'1 2 3',q1:['sort 比较器 cmp(x,x) 应是？',['true','false','视元素大小','总是抛出异常'],1,'严格关系必须不自反。'],q2:['按分数降序、编号升序的 Python key 是？',['(编号,分数)','(-编号,分数)','(-分数,编号)','(分数,-编号)'],2,'取负数反转分数顺序，同分再按编号升序。'],task:'将 (2,90),(1,90),(3,80) 按分数降序、同分编号升序排序，输出编号 1 2 3。',source:'https://eel.is/c++draft/alg.sorting'});
add({id:'stl-ranges',title:'Ranges 与 Views：组合式惰性处理',sub:'filter · transform · 管道组合',group:'现代标准扩展',standard:'C++20',extra:'#include <ranges>',sections:[['范围接口减少迭代器配对错误','ranges 算法可以直接接受范围，并用概念约束所需能力。views 把一串变换包装为范围适配器，适合表达筛选后映射的流程。'],['惰性视图不是已经计算的数组','filter 和 transform 通常在遍历时计算，不自动建立中间 vector。视图可能借用原容器，因此必须管理原容器寿命；反复遍历可能重复计算。'],['实践：筛偶数后平方','从 [1,2,3,4,5,6] 筛选偶数，再求平方得到 4、16、36。C++20 用管道串联，Python 用生成器表达式；两者都在消费时生成结果。']],pitfall:'不可把所有 ranges 功能都算作 C++20；ranges::to 等接口需要更新标准与实现支持。',cost:'完整消费 O(n)，不物化中间结果时额外空间 O(1)。',cpp:String.raw`int main(){vector<int>a{1,2,3,4,5,6};auto v=a|views::filter([](int x){return x%2==0;})|views::transform([](int x){return x*x;});for(int x:v)cout<<x<<' ';}`,py:`a = [1,2,3,4,5,6]
v = (x*x for x in a if x%2 == 0)
print(*v)`,out:'4 16 36',q1:['views::transform 通常何时计算元素？',['声明时全部计算','遍历访问时','编译时全部计算','程序退出时'],1,'视图一般惰性变换，不自动物化结果。'],q2:['过滤偶数再平方 [1,2,3,4] 得到？',['1 4 9 16','2 4','4 16','1 9'],2,'先留下 2、4，再计算平方。'],task:'用 C++20 views 和 Python 生成器筛出 1..6 的偶数并输出其平方，不建立中间筛选数组。',source:'https://eel.is/c++draft/ranges'});
// 以下原创建模实验配合数据结构教材范围，均明确说明实现边界。
const ods='https://opendatastructures.org/ods-cpp/';
const mit='https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/';
function ds(id,title,group,sections,pitfall,cost,cpp,py,out,q1,q2,task,source=ods){add({id,cat:'ds',title,sub:sections.map(s=>s[0]).join(' · '),group,sections,pitfall,cost,cpp,py,out,q1,q2,task,source,sourceTitle:source===ods?'Open Data Structures：开放教材':'课程与论文参考'});}
ds('ds-adt','ADT 与渐近复杂度','抽象与线性结构',[
 ['接口与表示分离','抽象数据类型描述允许做什么和操作的语义；数据结构描述如何存放数据。例如栈的 push/pop 是接口，动态数组或链表是不同实现。先写不变量，再决定表示。'],
 ['复杂度描述规模增长','O 给出渐近上界，Ω 给出下界，Θ 表示紧确界。最坏、平均、均摊分析回答不同问题，不能把实测毫秒数当作渐近复杂度证明。'],
 ['实践：数基本操作','内层从 0 循环到 i-1，总次数为 0+1+…+(n-1)=n(n-1)/2。n=5 时为 10，该例同时用循环和公式验证，说明三角循环仍为 Θ(n²)。']],
 '顺序执行的成本相加，嵌套循环只有在每层次数可独立估计时才能直接相乘。','计数程序 Θ(n²) 时间、O(1) 空间；公式 O(1)（固定字长算术模型）。',String.raw`int main(){int n=5;long long c=0;for(int i=0;i<n;++i)for(int j=0;j<i;++j)++c;cout<<c<<' '<<1LL*n*(n-1)/2;}`,`n = 5
c = 0
for i in range(n):
    for j in range(i): c += 1
print(c, n*(n-1)//2)`, '10 10',
 ['栈 ADT 主要规定什么？',['必须用链表','操作语义','内存地址','CPU 指令'],1,'ADT 定义语义，具体表示可以替换。'],['三角循环 0+1+…+(n-1) 的紧确界是？',['Θ(1)','Θ(log n)','Θ(n)','Θ(n²)'],3,'次数为 n(n-1)/2。'],'统计 n=5 时三角循环的基本操作次数，并用公式独立验证输出 10 10。');
ds('ds-dynamic-array','动态数组与均摊分析','抽象与线性结构',[
 ['容量不同于长度','长度是实际元素数，容量是已分配槽数。容量足够时追加只写入一个位置；空间不足时分配更大的缓冲区并复制已有元素。'],
 ['倍增把总搬移压低','容量按 1、2、4、8 增长，前 n 次追加的搬移总量是几何级数 O(n)，因此每次追加均摊 O(1)，但某一次扩容仍可能 O(n)。'],
 ['实践：记录扩容账本','追加整数 0..8，容量最终为 16，扩容搬移了 1+2+4+8=15 个元素。本例手写新缓冲区复制，以清楚区分普通追加与扩容成本。']],
 '每次仅增加一个槽会导致累计 Θ(n²) 搬移；不要把均摊 O(1) 解释成每次最坏 O(1)。','n 次追加 O(n) 总时间，O(n) 空间。',String.raw`int main(){int size=0,cap=0,moves=0;unique_ptr<int[]>a;for(int x=0;x<9;++x){if(size==cap){int nc=cap?cap*2:1;auto b=make_unique<int[]>(nc);for(int i=0;i<size;++i){b[i]=a[i];++moves;}a=move(b);cap=nc;}a[size++]=x;}cout<<size<<' '<<cap<<' '<<moves;}`,`size = cap = moves = 0
a = []
for x in range(9):
    if size == cap:
        nc = cap*2 if cap else 1
        b = [None]*nc
        for i in range(size):
            b[i] = a[i]
            moves += 1
        a, cap = b, nc
    a[size] = x
    size += 1
print(size, cap, moves)`, '9 16 15',
 ['倍增数组某次扩容的最坏成本？',['O(1)','O(log n)','O(n)','O(n²)'],2,'需要搬移已有的 n 个元素。'],['9 次追加容量从 0 按倍增扩展，最后容量？',['9','10','16','18'],2,'容量经历 1、2、4、8、16。'],'实现倍增动态数组，追加 0..8，输出长度、容量及搬移次数 9 16 15。');
ds('ds-doubly-circular','双向链表与循环哨兵','抽象与线性结构',[
 ['前驱和后继必须一致','双向链表每个节点存 prev 和 next，局部删除需同时接好两条方向相反的链接。已知节点位置时删除 O(1)，查找节点仍可能 O(n)。'],
 ['哨兵消除首尾特判','用一个不保存业务数据的哨兵构成循环，空表的 next 和 prev 都指向哨兵。头插、尾插、删除可以使用统一的邻接更新规则。'],
 ['实践：删除中间节点','使用数组下标模拟指针：0 为哨兵，1、2、3 为数据节点。删除节点 2 后从哨兵向后遍历得到 1、3；应同时验证 3 的前驱为 1。']],
 '只修改 next 会使正向遍历看似正常而反向链损坏；哨兵不能作为普通数据节点删除。','已知节点删除 O(1)，遍历 O(n)，节点存储 O(n)。',String.raw`int main(){vector<int>nxt{1,2,3,0},pre{3,0,1,2};int x=2;nxt[pre[x]]=nxt[x];pre[nxt[x]]=pre[x];for(int p=nxt[0];p!=0;p=nxt[p])cout<<p<<' ';cout<<'\n'<<pre[3];}`,`nxt = [1,2,3,0]
pre = [3,0,1,2]
x = 2
nxt[pre[x]] = nxt[x]
pre[nxt[x]] = pre[x]
p = nxt[0]
result = []
while p != 0:
    result.append(p)
    p = nxt[p]
print(*result)
print(pre[3])`,'1 3\n1',
 ['空的循环哨兵链表中，哨兵 next 指向？',['空指针','哨兵自身','最后删除节点','任意节点'],1,'空表仍保留一个自环哨兵。'],['删除已知节点后必须更新？',['仅前驱 next','仅后继 prev','前驱 next 与后继 prev','全部节点的值'],2,'双向链接的两端必须一致。'],'在循环双向链表 1→2→3 中删除 2，输出正向序列 1 3，再输出节点 3 的前驱 1。');
ds('ds-monotonic-stack','单调栈：下一个更大元素','抽象与线性结构',[
 ['保存尚未解决的位置','从左向右扫描，把下标压栈，并维持对应值单调不增。遇到更大的值时，它就是栈顶尚未解决元素右侧第一个更大值。'],
 ['每个元素只进出一次','虽然代码含有嵌套 while，但一个下标只入栈一次、出栈至多一次，因此总体 O(n)。需要严格更大时弹栈条件是 <，不是 <=。'],
 ['实践：填出下一更大值','数组 [2,1,2,4,3] 的答案为 [4,2,4,-1,-1]。答案暂设为 -1，栈只存下标，既能读取原值又能回填对应位置。']],
 '重复元素要先明确要求严格大于还是大于等于；这决定弹栈条件和答案语义。','O(n) 时间，O(n) 辅助空间。',String.raw`int main(){vector<int>a{2,1,2,4,3},ans(a.size(),-1),s;for(int i=0;i<(int)a.size();++i){while(!s.empty()&&a[s.back()]<a[i]){ans[s.back()]=a[i];s.pop_back();}s.push_back(i);}for(int x:ans)cout<<x<<' ';}`,`a = [2,1,2,4,3]
ans = [-1]*len(a)
s = []
for i,x in enumerate(a):
    while s and a[s[-1]] < x:
        ans[s.pop()] = x
    s.append(i)
print(*ans)`,'4 2 4 -1 -1',
 ['单调栈中存下标有什么好处？',['不占内存','能回填对应位置答案','自动排序数组','避免所有比较'],1,'下标同时定位原值与输出位置。'],['有内层 while 仍为 O(n) 的原因？',['while 从不执行','每个下标最多弹出一次','编译器自动去循环','数组必须有序'],1,'进栈与出栈总次数均为线性。'],'求 [2,1,2,4,3] 每个元素右侧第一个严格更大值；不存在时记 -1。');
ds('ds-monotonic-queue','单调队列：滑动窗口最大值','抽象与线性结构',[
 ['队首保留当前窗口最大值','用双端队列保存下标，按对应值从大到小排列。新值入队前清除队尾不大于它的元素，因为它们更早过期且不更优。'],
 ['过期清理和单调清理不同','队首下标 <= i-k 表示已经滑出窗口；队尾清理表示被更新更强的候选支配。两种删除条件分别维护合法性和最优性。'],
 ['实践：宽度为三的窗口','[1,3,-1,-3,5,3,6,7] 的六个长度 3 窗口最大值依次为 3、3、5、5、6、7。队列存下标才能判断过期。']],
 '必须校验 1<=k<=n；只存值无法可靠区分重复值的过期时间。','O(n) 时间，O(k) 辅助空间。',String.raw`int main(){vector<int>a{1,3,-1,-3,5,3,6,7};int k=3;deque<int>q;for(int i=0;i<(int)a.size();++i){while(!q.empty()&&q.front()<=i-k)q.pop_front();while(!q.empty()&&a[q.back()]<=a[i])q.pop_back();q.push_back(i);if(i>=k-1)cout<<a[q.front()]<<' ';}}`,`from collections import deque
a = [1,3,-1,-3,5,3,6,7]
k = 3
q = deque()
answer = []
for i,x in enumerate(a):
    while q and q[0] <= i-k: q.popleft()
    while q and a[q[-1]] <= x: q.pop()
    q.append(i)
    if i >= k-1: answer.append(a[q[0]])
print(*answer)`,'3 3 5 5 6 7',
 ['队首应清除何种下标？',['大于 i','小于等于 i-k','等于 i','所有偶数下标'],1,'这些位置不属于当前 [i-k+1,i] 窗口。'],['为何较新且更大的值能淘汰队尾？',['它更早过期','它不更差且更晚过期','两个值必相等','队列只能存一个元素'],1,'旧候选在后续窗口中不可能优于新候选。'],'求数组 [1,3,-1,-3,5,3,6,7] 的长度 3 滑动窗口最大值。');
ds('ds-hash-chain','散列表：链地址法与负载因子','散列与缓存',[
 ['散列定位不等于唯一定位','哈希函数把键映射到桶。不同键可能映射到同一个桶，这叫碰撞；链地址法在桶内保存多个条目，再用相等比较定位实际键。'],
 ['控制负载才有预期效率','负载因子 α=n/m 表示每桶平均元素数。在适当散列假设下查询期望 O(1+α)，严重碰撞时最坏 O(n)。扩容必须按新桶数重新分配条目。'],
 ['实践：同桶键仍独立保存','用键模 5 作为桶号，插入 1、6、11，它们都进入桶 1。检查桶内是否存在 6，得到 true；桶号相同不能替代键相等判断。']],
 '哈希函数不等于加密散列；对不可信输入还要考虑恶意碰撞以及容量上限。','本例插入末尾 O(1)；查询 O(桶长)，空间 O(n+m)。',String.raw`int main(){vector<vector<int>>b(5);for(int x:{1,6,11})b[x%5].push_back(x);int k=6;cout<<b[1].size()<<' '<<(find(b[k%5].begin(),b[k%5].end(),k)!=b[k%5].end());}`,`b = [[] for _ in range(5)]
for x in [1,6,11]: b[x%5].append(x)
k = 6
print(len(b[1]), int(k in b[k%5]))`,'3 1',
 ['两个不同键落入相同桶叫？',['排序','碰撞','复制','稳定性'],1,'碰撞是桶号相同而键不同。'],['链地址散列表最坏查询成本？',['O(1)','O(log n)','O(n)','O(n log n)'],2,'全部元素碰撞到一个桶时可能扫描所有键。'],'构造 5 桶链地址散列表，插入 1、6、11，输出桶 1 长度和是否存在键 6。');
ds('ds-hash-open','开放寻址：线性探测与删除标记','散列与缓存',[
 ['所有条目都保存在槽数组','线性探测从 h(k) 开始，遇到冲突就尝试下一个槽，循环回到数组头部。查询必须沿插入使用的同一探测序列继续。'],
 ['已删除不等于从未使用','删除直接清空会截断其他键的查找链。使用 EMPTY、OCCUPIED、DELETED 三态，查询遇 DELETED 继续，遇 EMPTY 才能判定不存在。'],
 ['实践：碰撞链上的删除','容量 5，插入键 1 和 6，它们分别落在槽 1、2。把槽 1 标成 DELETED，再查 6，必须继续探测并成功。本例演示删除后的搜索，不实现完整扩容。']],
 '探测循环必须有容量上界，否则满表可能死循环；大量墓碑需要重新散列清理。','低负载时通常期望 O(1)，最坏 O(m)，槽数组空间 O(m)。',String.raw`int main(){vector<int>key(5),state(5);key[1]=1;state[1]=1;key[2]=6;state[2]=1;state[1]=2;int k=6;bool found=false;for(int t=0;t<5;++t){int p=(k%5+t)%5;if(state[p]==0)break;if(state[p]==1&&key[p]==k){found=true;break;}}cout<<found;}`,`key = [0]*5
state = [0]*5 # 0:empty, 1:occupied, 2:deleted
key[1],state[1] = 1,1
key[2],state[2] = 6,1
state[1] = 2
k = 6
found = False
for t in range(5):
    p = (k%5+t)%5
    if state[p] == 0: break
    if state[p] == 1 and key[p] == k:
        found = True
        break
print(int(found))`,'1',
 ['搜索遇到 DELETED 槽应该？',['立即失败','继续探测','立刻成功','清空全表'],1,'它可能是其他碰撞键的探测路径。'],['线性探测需要何种终止保护？',['只能使用递归','最多检查容量个槽','永不停止','仅比较一次'],1,'满表或墓碑遍布时也必须能退出。'],'容量 5，键 1 与 6 冲突；删除键 1 后仍能成功查找键 6，输出 1。');
ds('ds-bst','二叉搜索树：有序性与查找','搜索树与平衡',[
 ['每个子树都遵守键的范围','BST 的左子树键小于节点键，右子树键大于节点键。本课采用集合语义，重复键忽略。中序遍历得到严格升序序列。'],
 ['查找路径由比较决定','小于当前键往左，大于往右，等于成功。插入沿相同路径到空位置。删除有零、一、两个孩子三种情况，双孩子常用后继替换再删后继。'],
 ['实践：构造后查询','插入 5、2、8、1、3，再查 3 与 7，结果分别成功和失败。用节点数组和下标代替裸指针，便于观察链接且无需手动回收内存。']],
 '按升序连续插入普通 BST 会退化成链，不能保证对数高度；删除与平衡需另行实现。','查找和插入 O(h)，最坏 h=n；空间 O(n)。',String.raw`struct N{int k,l=-1,r=-1;};int main(){vector<N>t;int root=-1;auto insert=[&](int x){if(root<0){root=0;t.push_back({x});return;}int p=root;while(true){if(x==t[p].k)return;bool left=x<t[p].k;int next=left?t[p].l:t[p].r;if(next<0){int z=t.size();if(left)t[p].l=z;else t[p].r=z;t.push_back({x});return;}p=next;}};for(int x:{5,2,8,1,3})insert(x);for(int x:{3,7}){int p=root;while(p>=0&&t[p].k!=x)p=x<t[p].k?t[p].l:t[p].r;cout<<(p>=0)<<' ';}}`,`t = []
root = -1
def insert(x):
    global root
    if root == -1:
        root = 0
        t.append([x,-1,-1])
        return
    p = root
    while True:
        if x == t[p][0]: return
        side = 1 if x < t[p][0] else 2
        if t[p][side] == -1:
            t[p][side] = len(t)
            t.append([x,-1,-1])
            return
        p = t[p][side]
for x in [5,2,8,1,3]: insert(x)
answer = []
for x in [3,7]:
    p = root
    while p >= 0 and t[p][0] != x:
        p = t[p][1 if x < t[p][0] else 2]
    answer.append(int(p >= 0))
print(*answer)`,'1 0',
 ['BST 中序遍历输出什么顺序？',['随机','升序','层序','按插入时间'],1,'左子树、根、右子树对应递增键。'],['普通 BST 升序插入可能导致？',['始终完美平衡','退化为链','自动红黑化','所有键被删除'],1,'高度可达到线性级别。'],'用节点数组实现 BST 插入与查找，插入 5、2、8、1、3，再输出 3 和 7 是否存在。',mit);
ds('ds-avl','AVL 树：高度平衡与旋转','搜索树与平衡',[
 ['高度差必须受限','AVL 要求每个节点左右子树高度之差绝对值不超过 1。维护高度字段可在插入路径上识别失衡，从而保证查找高度 O(log n)。'],
 ['旋转保持中序但改变高度','LL 用右旋，RR 用左旋，LR 和 RL 先对子树旋转再旋根。旋转后先更新较低节点高度，再更新新根，避免读取过期高度。'],
 ['实践：修复 LL 失衡','插入 30、20、10 后形成左链，对 30 右旋得到根 20，左右孩子 10 和 30。本例实现一次右旋及高度更新，聚焦局部机制，并非完整 AVL 增删库。']],
 '失衡分类由路径或子树平衡因子决定；只交换键值不等于完成结构旋转。','局部旋转 O(1)；完整 AVL 查询与更新 O(log n)。',String.raw`struct N{int key,h=1;N*l=nullptr,*r=nullptr;};int h(N*x){return x?x->h:0;}void fix(N*x){x->h=1+max(h(x->l),h(x->r));}N*right(N*y){N*x=y->l;y->l=x->r;x->r=y;fix(y);fix(x);return x;}int main(){N a{30},b{20},c{10};a.l=&b;b.l=&c;fix(&b);fix(&a);N*r=right(&a);cout<<r->key<<' '<<r->l->key<<' '<<r->r->key<<' '<<r->h;}`,`class N:
    def __init__(self,key): self.key,self.h,self.l,self.r = key,1,None,None
def height(x): return x.h if x else 0
def fix(x): x.h = 1+max(height(x.l),height(x.r))
def right(y):
    x = y.l
    y.l = x.r
    x.r = y
    fix(y)
    fix(x)
    return x
a,b,c = N(30),N(20),N(10)
a.l,b.l = b,c
fix(b)
fix(a)
r = right(a)
print(r.key,r.l.key,r.r.key,r.h)`,'20 10 30 2',
 ['AVL 每个节点左右高度差的绝对值最多？',['0','1','2','随意'],1,'局部高度平衡约束为不超过 1。'],['30→20→10 的 LL 失衡如何修复？',['对 30 右旋','对 30 左旋','删除 20','只修改高度'],0,'右旋使 20 成为新根，仍保持中序 10、20、30。'],'实现一次 AVL 右旋，修复 30、20、10 的左链，输出新根、两个孩子和新高度。',mit);
ds('ds-red-black','红黑树：颜色与黑高不变量','搜索树与平衡',[
 ['较宽松的平衡约束','红黑树是 BST，根为黑色，空叶视为黑色，不允许红节点拥有红孩子；从任一节点到空叶的路径黑节点数量相同。这些约束限制树高为 O(log n)。'],
 ['修复依赖染色和旋转','插入通常先染红，以免立即改变黑高；根据父亲、叔叔颜色选择重新染色或旋转。删除黑节点可能使某条路径少一个黑节点，需要进一步修复。'],
 ['实践：验证颜色结构','根 2 为黑，孩子 1 和 3 为红，是合法的颜色结构。程序递归计算黑高，遇连续红或黑高不等返回失败；故意把节点 1 改黑后应失败。代码只验证颜色约束，BST 键序另需检查。']],
 '黑高计数可以包含或不包含空叶，但整个实现必须一致。本例空叶黑高为 1。','检查给定树 O(n) 时间，递归空间 O(h)；完整红黑树更新 O(log n)。',String.raw`struct N{bool red;N*l=nullptr,*r=nullptr;};int check(N*x){if(!x)return 1;if(x->red&&((x->l&&x->l->red)||(x->r&&x->r->red)))return -1;int a=check(x->l),b=check(x->r);if(a<0||a!=b)return -1;return a+!x->red;}int main(){N l{true},r{true},root{false,&l,&r};cout<<(!root.red&&check(&root)>0)<<' ';l.red=false;cout<<(!root.red&&check(&root)>0);}`,`class N:
    def __init__(self,red,l=None,r=None): self.red,self.l,self.r = red,l,r
def check(x):
    if x is None: return 1
    if x.red and ((x.l and x.l.red) or (x.r and x.r.red)): return -1
    a,b = check(x.l),check(x.r)
    if a < 0 or a != b: return -1
    return a + int(not x.red)
l,r = N(True),N(True)
root = N(False,l,r)
first = int(not root.red and check(root)>0)
l.red = False
print(first,int(not root.red and check(root)>0))`,'1 0',
 ['红黑树允许红节点的孩子为红吗？',['允许','不允许','仅根允许','仅右孩子允许'],1,'禁止连续红边。'],['合法树中只把某一个红叶改黑可能怎样？',['总会更平衡','破坏等黑高','自动改变键序','没有任何影响'],1,'仅经过该叶的路径黑高增加。'],'编写颜色约束检查器，验证黑根+两个红孩子合法，再把左孩子染黑并检测不合法。');
ds('ds-btree','B 树：多路搜索与节点分裂','搜索树与平衡',[
 ['一个节点容纳多个有序键','B 树面向块存储，节点包含多个键和孩子，所有叶子同深。最小度数 t 的非根节点至少 t-1 个键，最多 2t-1 个键；多路分支降低访问层数。'],
 ['满节点分裂并上推中位键','将满节点的中间键提升到父亲，左右剩余键分别形成两个节点。根分裂会增加整体高度，但所有叶子仍保持相同深度。'],
 ['实践：分裂一个满根','t=2，根键为 [10,20,30] 时，上推 20，新左右节点为 [10] 和 [30]。代码只实现叶根分裂；完整插入还需沿路径处理父节点空间。']],
 '不要混用最小度数 t 和“阶”的定义；不同教材对阶的定义可能不同。','本例分裂 O(t) 时间空间；完整树块访问层数 O(log_t n)。',String.raw`int main(){int t=2;vector<int>keys{10,20,30};int mid=keys[t-1];vector<int>left(keys.begin(),keys.begin()+t-1),right(keys.begin()+t,keys.end());cout<<mid<<'\n';for(int x:left)cout<<x<<' ';cout<<'\n';for(int x:right)cout<<x<<' ';}`,`t = 2
keys = [10,20,30]
mid = keys[t-1]
left,right = keys[:t-1],keys[t:]
print(mid)
print(*left)
print(*right)`,'20\n10\n30',
 ['B 树所有叶子的深度？',['可以任意不同','相同','只允许两个叶子','由键值决定'],1,'所有叶子同深是 B 树结构约束。'],['t=2 的满节点最多几个键？',['2','3','4','5'],1,'上限 2t-1=3。'],'实现 t=2 时 [10,20,30] 的叶根分裂，输出提升键和左右节点键。');
ds('ds-bplus','B+ 树：叶链与范围扫描','搜索树与平衡',[
 ['内部节点负责导航','常见 B+ 树内部节点存分隔键和孩子指针，完整数据项保存在叶子。内部索引可以更紧凑，较大扇出有利于减少块访问。'],
 ['有序叶链支持范围访问','先通过树索引定位起点所在叶，再沿叶链顺序扫描，直到键大于上界。范围查询成本取决于定位成本加访问的叶块和输出数量。'],
 ['实践：沿叶链收集区间','叶页依次为 [1,3]、[5,7]、[9,11]，查询闭区间 [4,9]，输出 5、7、9。本例从已知起点页开始，聚焦叶链扫描，不假装实现完整 B+ 树。']],
 'B 树与 B+ 树的记录布局不同；真实数据库还包含页分裂、并发控制、日志与恢复。','已定位叶页后扫描 O(访问键数)，输出空间 O(k)。',String.raw`int main(){vector<vector<int>>pages{{1,3},{5,7},{9,11}};vector<int>next{1,2,-1};int low=4,high=9;for(int p=1;p!=-1;p=next[p])for(int key:pages[p]){if(key>high)return 0;if(key>=low)cout<<key<<' ';}}`,`pages = [[1,3],[5,7],[9,11]]
nxt = [1,2,-1]
def scan(start,low,high):
    p = start
    while p != -1:
        for key in pages[p]:
            if key > high: return
            if key >= low: yield key
        p = nxt[p]
print(*scan(1,4,9))`,'5 7 9',
 ['B+ 树叶链主要便利什么？',['任意字符串加密','有序范围扫描','完全避免索引定位','避免所有页分裂'],1,'定位起点后可顺序跨叶页读取。'],['区间 [4,9] 中属于结果的是？',['3 5 7','5 7 9','4 6 8','9 11'],1,'闭区间包含 9，不包含 3 和 11。'],'在给定的三页叶链中，从页 1 开始扫描 [4,9]，输出 5 7 9；大于上界立即停止。');
ds('ds-binary-heap','二叉堆：上浮、下沉与建堆','堆与编码',[
 ['完全二叉树对应紧凑数组','零下标节点 i 的孩子为 2i+1 和 2i+2。最小堆只保证父键不大于孩子，兄弟及不同子树之间不要求完全排序。'],
 ['更新只修复一条路径','插入在末尾添加后上浮；取最小值把末尾移到根再下沉。自底向上的 Floyd 建堆从最后一个非叶节点开始下沉，总成本 O(n)。'],
 ['实践：手写插入上浮','依次插入 5、2、7、1，每次交换不满足堆序的父子，最终根为 1。输出实际数组 1、2、7、5，可观察堆数组不等于排序数组。']],
 '孩子下标必须先检查是否越界；需要删除任意元素时还要维护元素到堆位置的索引。','单次插入 O(log n)，n 次逐个插入 O(n log n)；空间 O(n)。',String.raw`int main(){vector<int>h;for(int x:{5,2,7,1}){h.push_back(x);int i=h.size()-1;while(i>0){int p=(i-1)/2;if(h[p]<=h[i])break;swap(h[p],h[i]);i=p;}}for(int x:h)cout<<x<<' ';}`,`h = []
for x in [5,2,7,1]:
    h.append(x)
    i = len(h)-1
    while i > 0:
        p = (i-1)//2
        if h[p] <= h[i]: break
        h[p],h[i] = h[i],h[p]
        i = p
print(*h)`,'1 2 7 5',
 ['最小堆必定保证？',['整个数组升序','父节点不大于孩子','左孩子小于右孩子','高度等于节点数'],1,'堆序约束只沿父子边。'],['自底向上 Floyd 建堆成本？',['O(n)','O(n log n) 紧确界','O(n²)','O(1)'],0,'大量节点高度很低，所有下沉成本累加为线性。'],'不用现成堆接口，逐个插入 5、2、7、1，通过上浮维护最小堆并输出堆数组。',mit);
ds('ds-huffman','Huffman 树与最优前缀编码','堆与编码',[
 ['前缀编码支持无歧义解码','没有一个码字是另一个码字的前缀。二叉编码树的叶子代表符号，从根到叶路径给出码字，编码总代价为频率乘深度的总和。'],
 ['反复合并最小权重','用最小堆每次取两个最小权重，合并后放回。各次合并权重之和等于最终加权路径长度；同频可能产生不同但同成本的编码。'],
 ['实践：计算最小编码代价','权重 [2,3,7,9]：先合并 2+3=5，再 5+7=12，最后 9+12=21，总成本 5+12+21=38。本例计算代价，生成具体码字还需要保存树节点。']],
 '单符号源若使用空码需另存消息长度；实际编码格式常规定至少一位并记录码表。','O(n log n) 时间，O(n) 堆空间。',String.raw`int main(){priority_queue<int,vector<int>,greater<int>>q;for(int x:{2,3,7,9})q.push(x);int cost=0;while(q.size()>1){int a=q.top();q.pop();int b=q.top();q.pop();cost+=a+b;q.push(a+b);}cout<<cost;}`,`import heapq
q = [2,3,7,9]
heapq.heapify(q)
cost = 0
while len(q)>1:
    x = heapq.heappop(q)+heapq.heappop(q)
    cost += x
    heapq.heappush(q,x)
print(cost)`,'38',
 ['Huffman 每轮合并哪两个权重？',['最大两个','最小两个','任意两个','最接近平均数的两个'],1,'贪心选择当前最小的两个。'],['[2,3,7,9] 的合并总代价？',['21','26','38','42'],2,'5+12+21=38。'],'用最小堆计算权重 [2,3,7,9] 的 Huffman 加权路径长度，输出 38。', 'https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/pages/lecture-notes/');
const handbook='https://cses.fi/book/book.pdf';
ds('ds-dsu','并查集：路径压缩与按大小合并','图与集合',[
 ['代表元描述连通分量','每个元素指向父节点，根是所在集合的代表。find 找根，union 合并两个根；若根相同则已连通。它适用于只合并、不拆分的动态连通关系。'],
 ['两种优化配合使用','路径压缩使访问过的节点更靠近根，按大小合并把小树接到大树。两者共同使一系列操作的均摊成本接近常数，严格表达为反阿克曼函数级别。'],
 ['实践：合并再判连通','对 0..4，依次合并 (0,1)、(1,2)、(3,4)。0 与 2 连通，0 与 4 不连通。代码维护每个根的 size，合并后只有根的大小有意义。']],
 '普通路径压缩并查集不能直接支持撤销或删除边；这些需要回滚或离线等额外设计。','m 次操作通常 O((n+m)α(n))，空间 O(n)。',String.raw`int main(){vector<int>p(5),sz(5,1);iota(p.begin(),p.end(),0);function<int(int)>find=[&](int x){return p[x]==x?x:p[x]=find(p[x]);};auto unite=[&](int a,int b){a=find(a);b=find(b);if(a==b)return;if(sz[a]<sz[b])swap(a,b);p[b]=a;sz[a]+=sz[b];};unite(0,1);unite(1,2);unite(3,4);cout<<(find(0)==find(2))<<' '<<(find(0)==find(4));}`,`p = list(range(5))
size = [1]*5
def find(x):
    if p[x] != x: p[x] = find(p[x])
    return p[x]
def unite(a,b):
    a,b = find(a),find(b)
    if a == b: return
    if size[a] < size[b]: a,b = b,a
    p[b] = a
    size[a] += size[b]
unite(0,1)
unite(1,2)
unite(3,4)
print(int(find(0)==find(2)),int(find(0)==find(4)))`,'1 0',
 ['判断两元素是否同集合应比较？',['元素值是否相等','代表元是否相同','父节点编号大小','插入时间'],1,'父节点可能不同，但最终根相同。'],['按大小合并应把哪棵树接到另一棵？',['大树接小树','小树接大树','随机删除一棵','只交换大小'],1,'小树接大树可控制高度增长。'],'实现压缩路径与按大小合并，对指定三个合并操作输出 0与2、0与4 是否连通。',handbook);
ds('ds-trie','Trie：字符前缀与终止标记','图与集合',[
 ['公共前缀共享路径','根表示空前缀，每条边表示一个字符。单词 cat 和 car 共享 c、a 两条边后分叉，查找逐字符沿路径行走。'],
 ['路径存在不等于单词存在','必须单独保存 end 标记区分完整单词与前缀。仅插入 cat 后，ca 的路径存在但不是完整单词；空字符串可由根的 end 标记表示。'],
 ['实践：区分单词与前缀','插入 cat、car、dog，检查 car、ca、cow，输出 1、0、0。本例以字符到下标的映射存孩子，便于扩展字符集；实际 Unicode 处理需先定义编码单位。']],
 'C++ char 对 UTF-8 逐字节处理，Python str 逐码点处理；本例输入限定 ASCII，不能直接宣称两者等价处理任意 Unicode。','长度 L 的单词查询平均 O(L)，总节点数不超过所有单词长度之和加一。',String.raw`struct T{unordered_map<char,int>next;bool end=false;};int main(){vector<T>t(1);for(string s:{"cat","car","dog"}){int p=0;for(char c:s){if(!t[p].next.count(c)){int z=t.size();t[p].next[c]=z;t.push_back({});}p=t[p].next[c];}t[p].end=true;}for(string s:{"car","ca","cow"}){int p=0;for(char c:s){auto it=t[p].next.find(c);if(it==t[p].next.end()){p=-1;break;}p=it->second;}cout<<(p>=0&&t[p].end)<<' ';}}`,`root = {}
for word in ['cat','car','dog']:
    p = root
    for c in word: p = p.setdefault(c,{})
    p['#'] = True
def contains(word):
    p = root
    for c in word:
        if c not in p: return False
        p = p[c]
    return '#' in p
print(*(int(contains(w)) for w in ['car','ca','cow']))`,'1 0 0',
 ['Trie 必须有终止标记的原因？',['防止所有碰撞','区分完整单词与前缀','使空间总为 O(1)','自动排序长度'],1,'单词路径中的每个中间前缀未必也是单词。'],['只插入 cat 和 car 时 ca 是否是完整单词？',['是','不是','随机','取决于排序'],1,'其路径存在，但终止标记为假。'],'实现 ASCII Trie，插入 cat、car、dog，分别检查 car、ca、cow 是否为完整单词。',handbook);
ds('ds-graph-storage','图的存储：邻接表、矩阵与边集','图与集合',[
 ['先确定图的语义','顶点和边构成图；有向边有起终点，无向边通常存两个方向。还需明确是否允许自环、重边以及边权，表示应服务后续操作。'],
 ['密度决定表示取舍','邻接矩阵占 O(V²) 空间，查询某条边 O(1)。邻接表占 O(V+E)，遍历一个顶点的出边 O(出度)。边集方便排序边，但找邻居往往需要全扫。'],
 ['实践：建立无向邻接表','边为 (0,1)、(0,2)、(1,3)，分别加入两个方向。四个顶点度数为 2、2、1、1，总和 6 等于两倍边数，作为构造结果的检查。']],
 '无向自环对度数贡献 2；去重边与保留多重边是不同的数据模型，不应默默改变。','建表 O(V+E) 时间空间，读取各顶点度数 O(V)。',String.raw`int main(){vector<vector<int>>g(4);for(auto [u,v]:vector<pair<int,int>>{{0,1},{0,2},{1,3}}){g[u].push_back(v);g[v].push_back(u);}for(auto&adj:g)cout<<adj.size()<<' ';}`,`g = [[] for _ in range(4)]
for u,v in [(0,1),(0,2),(1,3)]:
    g[u].append(v)
    g[v].append(u)
print(*(len(adj) for adj in g))`,'2 2 1 1',
 ['邻接矩阵的空间复杂度？',['O(V)','O(E)','O(V²)','O(log V)'],2,'矩阵有 V×V 个位置。'],['简单无向图所有顶点度数之和等于？',['E','2E','V','V+E'],1,'每条边贡献两个端点。'],'建立四顶点无向图的邻接表，边为 (0,1),(0,2),(1,3)，输出各顶点度数。');
ds('ds-fenwick','树状数组：lowbit 与前缀和','区间与持久化',[
 ['每格维护一个二进制区间','一基下标的 tree[i] 维护以 i 为右端、长度 lowbit(i) 的区间。lowbit(i)=i&(-i)，描述 i 最低的一个置位。'],
 ['查询向前，更新向后','前缀查询反复 i-=lowbit(i)，把不重叠区间累加；单点增加反复 i+=lowbit(i)，更新所有覆盖该位置的区间。区间和用两个前缀和相减。'],
 ['实践：更新后查询子区间','初始 [2,1,3,4,5]，将位置 3 增加 2，再求一基闭区间 [2,4] 的和：1+5+4=10。例子封装 add 和 sum，0 只作为前缀终止点。']],
 '不能调用 add(0,delta)，因为 lowbit(0)=0 会导致死循环；接口应强制合法一基下标。','单次更新和查询 O(log n)，本例逐个初始化 O(n log n)，空间 O(n)。',String.raw`int main(){int n=5;vector<int>t(n+1);auto add=[&](int i,int d){if(i<1||i>n)throw out_of_range("index");for(;i<=n;i+=i&-i)t[i]+=d;};auto sum=[&](int i){int s=0;for(;i>0;i-=i&-i)s+=t[i];return s;};vector<int>a{2,1,3,4,5};for(int i=0;i<n;++i)add(i+1,a[i]);add(3,2);cout<<sum(4)-sum(1);}`,`a = [2,1,3,4,5]
n = len(a)
t = [0]*(n+1)
def add(i,d):
    if not 1 <= i <= n: raise IndexError(i)
    while i <= n:
        t[i] += d
        i += i & -i
def prefix(i):
    s = 0
    while i > 0:
        s += t[i]
        i -= i & -i
    return s
for i,x in enumerate(a,1): add(i,x)
add(3,2)
print(prefix(4)-prefix(1))`,'10',
 ['lowbit(12) 的值？',['1','2','4','8'],2,'12 的二进制为 1100，最低置位是 4。'],['区间 [l,r] 和应怎样求？',['sum(r)+sum(l)','sum(r)-sum(l-1)','sum(l)-sum(r)','只看 tree[r]'],1,'移除 r 前缀中 l 之前的部分。'],'实现树状数组，对 [2,1,3,4,5] 的第3个元素增加2，再查询第2到第4个元素和。',handbook);
ds('ds-segment-tree','线段树：区间合并与单点修改','区间与持久化',[
 ['把序列分成递归区间','叶节点代表单个元素，内部节点保存子区间聚合值。只要合并运算满足结合律并有合适单位元，就能支持和、最小值等多种查询。'],
 ['区间查询分解成少量节点','迭代式线段树把叶子放在数组后半部，查询半开区间 [l,r) 时左右边界向上移动，必要时吸收边界节点。修改叶后更新所有祖先。'],
 ['实践：单点赋值与区间和','数组 [2,1,3,4] 中把下标 1 改为 5，再求 [1,4) 的和为 12。例子用求和作为合并运算，单位元为 0。']],
 '区间批量更新若逐点处理会慢；懒标记需额外维护区间长度以及标记合成规则，本例只实现单点修改。','建树 O(n)，单点修改与区间查询 O(log n)，空间 O(n)。',String.raw`int main(){int n=4;vector<int>t(2*n);vector<int>a{2,1,3,4};copy(a.begin(),a.end(),t.begin()+n);for(int i=n-1;i>0;--i)t[i]=t[i*2]+t[i*2+1];int p=n+1;t[p]=5;while(p>1){p/=2;t[p]=t[p*2]+t[p*2+1];}int ans=0;for(int l=n+1,r=n+4;l<r;l/=2,r/=2){if(l&1)ans+=t[l++];if(r&1)ans+=t[--r];}cout<<ans;}`,`a = [2,1,3,4]
n = len(a)
t = [0]*n+a
for i in range(n-1,0,-1): t[i] = t[2*i]+t[2*i+1]
p = n+1
t[p] = 5
while p > 1:
    p //= 2
    t[p] = t[2*p]+t[2*p+1]
l,r,ans = n+1,n+4,0
while l < r:
    if l & 1:
        ans += t[l]
        l += 1
    if r & 1:
        r -= 1
        ans += t[r]
    l //= 2
    r //= 2
print(ans)`,'12',
 ['区间求和的单位元是？',['-1','0','1','无穷大'],1,'加 0 不改变聚合值。'],['[1,4) 包含几个整数下标？',['2','3','4','5'],1,'包含 1、2、3，不含 4。'],'实现迭代线段树，将 [2,1,3,4] 的下标1赋值为5，查询半开区间 [1,4) 之和。',handbook);
ds('ds-sparse-table','稀疏表：静态区间最值','区间与持久化',[
 ['预计算二的幂长度区间','st[k][i] 保存从 i 开始长度 2^k 的区间最值，由左右两个长度 2^(k-1) 的区间合并得到。预处理后适合数组不变且查询很多的场景。'],
 ['两个重叠块即可回答最小值','对于长度 len，令 k=floor(log2(len))，用左端块与右端块覆盖整个区间。min 的幂等性让重叠部分重复计算也不影响结果。'],
 ['实践：查询静态数组','[8,6,7,3,9] 的闭区间 [1,4] 最小值为 3。整数循环构造 log 表，避免浮点 log2 在边界附近产生误差。']],
 '两块重叠查询不能直接套用于求和，否则重叠元素被重复计数；修改原数组也会使预处理结果失效。','预处理 O(n log n) 时间空间，RMQ 查询 O(1)。',String.raw`int main(){vector<int>a{8,6,7,3,9};int n=a.size();vector<int>lg(n+1);for(int i=2;i<=n;++i)lg[i]=lg[i/2]+1;vector<vector<int>>st(lg[n]+1,vector<int>(n));st[0]=a;for(int k=1;k<=lg[n];++k)for(int i=0;i+(1<<k)<=n;++i)st[k][i]=min(st[k-1][i],st[k-1][i+(1<<(k-1))]);int l=1,r=4,k=lg[r-l+1];cout<<min(st[k][l],st[k][r-(1<<k)+1]);}`,`a = [8,6,7,3,9]
n = len(a)
lg = [0]*(n+1)
for i in range(2,n+1): lg[i] = lg[i//2]+1
st = [a[:]]+[[0]*n for _ in range(lg[n])]
for k in range(1,lg[n]+1):
    for i in range(n-(1<<k)+1):
        st[k][i] = min(st[k-1][i],st[k-1][i+(1<<(k-1))])
l,r = 1,4
k = lg[r-l+1]
print(min(st[k][l],st[k][r-(1<<k)+1]))`,'3',
 ['稀疏表特别适合哪类场景？',['频繁区间修改','静态数组大量最值查询','在线删点','任意图最短路'],1,'预处理后查询快，但更新成本高。'],['重叠两块求 min 正确依赖？',['交换律就足够','min 的幂等性','区间必须不重叠','元素全相等'],1,'重复处理同一元素不会改变最小值。'],'构建稀疏表，查询 [8,6,7,3,9] 的零基闭区间 [1,4] 最小值，输出3。',handbook);
ds('ds-bloom','Bloom Filter：允许误报的成员过滤','散列与缓存',[
 ['用位数组换取空间节约','插入一个键时，用多个哈希函数定位若干位并置1；查询时任何一位为0就确定不存在，全部为1只能说可能存在，仍可能是别的键共同置位。'],
 ['误报与漏报必须区分','在不删除、位数组不损坏且哈希一致的条件下，已插入键不会被漏报。误报概率取决于位数、插入量及哈希数量，哈希数量并非越多越好。'],
 ['实践：主动构造一次误报','使用8位数组和两个演示哈希 h1=x mod 8、h2=(3x+1) mod 8。插入1后，查询1成功；查询9也得到可能存在，展示碰撞误报；查询2则确定不存在。']],
 '演示哈希不是生产级独立哈希。不能直接清除某键对应位来删除，因为那些位可能被其他键共享。','每次操作 O(k)，m 位数组占 O(m) 位；示例用整数数组便于观察，未做位压缩。',String.raw`int main(){array<int,8>b{};auto pos=[](int x){return array<int,2>{x%8,(3*x+1)%8};};for(int p:pos(1))b[p]=1;for(int x:{1,9,2}){bool yes=true;for(int p:pos(x))yes=yes&&b[p];cout<<yes<<' ';}}`,`bits = [0]*8
def positions(x): return [x%8,(3*x+1)%8]
for p in positions(1): bits[p] = 1
print(*(int(all(bits[p] for p in positions(x))) for x in [1,9,2]))`,'1 1 0',
 ['Bloom 查询所有位都是1意味着？',['一定存在','可能存在','一定不存在','数组已满'],1,'碰撞会导致误报，需要精确存储进一步确认。'],['普通 Bloom Filter 为何不能直接清位删除？',['不能读位','可能清掉其他键共享的位','键无法散列','会自动扩容'],1,'共享位被清除后可能引入漏报。'],'用8位和给定两个哈希插入1，查询1、9、2，输出1 1 0并解释9为何误报。','https://www.cse.cuhk.edu.hk/~taoyf/course/wst501/notes/lec2.pdf');
ds('ds-lru','LRU 缓存：散列表与双向链表','散列与缓存',[
 ['最近使用顺序决定淘汰','容量有限时淘汰最久未使用的键。读命中和写入都将键移到最近使用端；单纯使用插入顺序不等于 LRU。'],
 ['两种结构共同实现常数操作','散列表从键定位双向链表节点，链表负责 O(1) 移动与删除。C++ list::splice 可移动节点且保持迭代器有效，Python OrderedDict 提供相应顺序操作。'],
 ['实践：命中刷新淘汰顺序','容量2，依次 put(1,10)、put(2,20)、get(1)、put(3,30)。因为1刚访问，2被淘汰。随后 get(2) 返回-1，get(3) 返回30。']],
 '若 -1 是合法值，实际API应使用 optional、None 或显式命中状态表示缺失；并发访问还需要同步机制。','哈希正常时每次期望 O(1)，容量为C时空间 O(C)。',String.raw`int main(){int cap=2;list<pair<int,int>>q;unordered_map<int,list<pair<int,int>>::iterator>m;auto put=[&](int k,int v){if(m.count(k)){m[k]->second=v;q.splice(q.begin(),q,m[k]);return;}q.push_front({k,v});m[k]=q.begin();if((int)q.size()>cap){m.erase(q.back().first);q.pop_back();}};auto get=[&](int k){if(!m.count(k))return -1;q.splice(q.begin(),q,m[k]);return m[k]->second;};put(1,10);put(2,20);cout<<get(1)<<' ';put(3,30);cout<<get(2)<<' '<<get(3);}`,`from collections import OrderedDict
cap = 2
q = OrderedDict()
def put(k,v):
    q[k] = v
    q.move_to_end(k)
    if len(q)>cap: q.popitem(last=False)
def get(k):
    if k not in q: return -1
    q.move_to_end(k)
    return q[k]
put(1,10)
put(2,20)
first = get(1)
put(3,30)
print(first,get(2),get(3))`,'10 -1 30',
 ['LRU 命中读取后应做什么？',['保持原位置','刷新为最近使用','立刻淘汰','增加容量'],1,'读取也算使用。'],['容量2，写1、写2、读1、写3后淘汰谁？',['1','2','3','都不淘汰'],1,'2是最久未使用的键。'],'实现容量2的LRU，执行给定操作并输出10 -1 30，使用哈希索引与有序节点结构。','https://docs.python.org/3/library/collections.html#ordereddict-objects');
ds('ds-skiplist','跳表：分层索引与查找路径','搜索树与平衡',[
 ['有序链表加多层快捷指针','底层保存所有键，上层保存一部分键。查找从最高层开始向右跳，下一步将超过目标时下降一层，直到最底层确认相等。'],
 ['随机层高控制期望成本','通常每升一层独立以固定概率继续，形成几何分布。高度和查找路径的期望为 O(log n)，最坏仍可能线性；插入需记录每层前驱以连接新节点。'],
 ['实践：追踪静态两层查找','底层键为1、3、5、7，上层仅连接3和7。从高层跳到3，再下降到5查找成功。代码构造固定层高来展示搜索，未实现随机插入和删除。']],
 '不要把“期望 O(log n)”写成无条件最坏保证；本例两层固定示意不具备随n增长的完整随机跳表性能。','示例搜索最坏 O(n)，完整随机跳表期望查询 O(log n)，期望空间 O(n)。',String.raw`int main(){vector<int>key{-1,1,3,5,7};vector<array<int,2>>next{{1,2},{2,-1},{3,4},{4,-1},{-1,-1}};for(int target:{5,6}){int p=0;for(int level=1;level>=0;--level)while(next[p][level]!=-1&&key[next[p][level]]<target)p=next[p][level];int q=next[p][0];cout<<(q!=-1&&key[q]==target)<<' ';}}`,`keys = [-1,1,3,5,7]
nxt = [[1,2],[2,-1],[3,4],[4,-1],[-1,-1]]
answer = []
for target in [5,6]:
    p = 0
    for level in [1,0]:
        while nxt[p][level] != -1 and keys[nxt[p][level]] < target:
            p = nxt[p][level]
    q = nxt[p][0]
    answer.append(int(q != -1 and keys[q] == target))
print(*answer)`,'1 0',
 ['跳表查找通常从哪里开始？',['底层最后节点','最高层头部','随机叶子','每次遍历全部层'],1,'从稀疏高层快速跳转，再逐层下降。'],['随机跳表 O(log n) 查找通常是什么保证？',['所有输入的严格最坏','期望','只对空表','与随机性无关'],1,'合理独立层高下可得期望性能。'],'按给定两层指针实现跳表查找，分别查5和6，输出1 0；解释何时下降层。');
ds('ds-persistent','可持久化结构：路径复制与历史版本','区间与持久化',[
 ['更新后仍保留旧版本','这里的持久化指数据结构版本可继续访问，不是写入磁盘。部分持久化只更新最新版本，完全持久化允许从任意旧版本分叉更新。'],
 ['复制路径，复用未改的子树','更新平衡树某一叶时，只复制根到该叶的路径，其余子树保持共享且不再修改。各版本保存不同根，查询时选择对应根即可。'],
 ['实践：保存两个区间和版本','初始数组 [1,2,3,4] 的总和10；从初始根复制路径，把下标1改为9，新根总和17，旧根仍为10。本例实现线段树建树和单点路径复制，演示版本隔离。']],
 '共享节点不能被原地修改；C++ 实际系统还要设计版本回收，本例用 shared_ptr 管理所有权。','初始建树 O(n)，每次修改 O(log n) 时间和新增节点，读取根汇总 O(1)。',String.raw`struct N{int sum;shared_ptr<N>l,r;N(int s,shared_ptr<N>a=nullptr,shared_ptr<N>b=nullptr):sum(s),l(a),r(b){}};using P=shared_ptr<N>;P build(const vector<int>&a,int l,int r){if(r-l==1)return make_shared<N>(a[l]);int m=(l+r)/2;P x=build(a,l,m),y=build(a,m,r);return make_shared<N>(x->sum+y->sum,x,y);}P change(P old,int l,int r,int i,int v){if(r-l==1)return make_shared<N>(v);int m=(l+r)/2;P x=old->l,y=old->r;if(i<m)x=change(x,l,m,i,v);else y=change(y,m,r,i,v);return make_shared<N>(x->sum+y->sum,x,y);}int main(){P a=build({1,2,3,4},0,4),b=change(a,0,4,1,9);cout<<a->sum<<' '<<b->sum;}`,`from dataclasses import dataclass
@dataclass(frozen=True)
class Node:
    total: int
    left: object = None
    right: object = None
def build(a,l,r):
    if r-l == 1: return Node(a[l])
    m = (l+r)//2
    x,y = build(a,l,m),build(a,m,r)
    return Node(x.total+y.total,x,y)
def change(old,l,r,i,v):
    if r-l == 1: return Node(v)
    m = (l+r)//2
    x,y = old.left,old.right
    if i < m: x = change(x,l,m,i,v)
    else: y = change(y,m,r,i,v)
    return Node(x.total+y.total,x,y)
a = build([1,2,3,4],0,4)
b = change(a,0,4,1,9)
print(a.total,b.total)`,'10 17',
 ['本课“持久化”主要指什么？',['写入硬盘','保留可访问历史版本','程序永不退出','所有节点都深拷贝'],1,'数据结构更新后旧版本仍有效，与磁盘持久化不是同一概念。'],['路径复制可以复用哪部分？',['被修改的叶子','没有改变的子树','所有根都共用可变值','所有数组都必须复制'],1,'未修改子树保持不可变，可被多个版本共享。'],'建立 [1,2,3,4] 的持久化线段树，从旧版本把下标1改为9，打印旧版和新版总和10 17。','https://www.cs.cmu.edu/~sleator/papers/making-data-structures-persistent.pdf');
})();

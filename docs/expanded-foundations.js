/* 补充容易被入门目录遗漏的标准库与工程专题。 */
(() => {
const cite=(title,url,extra={})=>Object.assign(LESSONS.at(-1),{sources:[[title,url]],outputTestable:true,...extra});
lesson('stl-pmr','stl','allocator 与 PMR 内存资源','分配策略 · 资源生命周期 · 批量释放','资源管理与工程边界',26,
 [['把容器行为与内存来源分开','allocator 决定容器如何申请和释放存储，容器仍负责元素的构造与析构。C++17 的 std::pmr::polymorphic_allocator 可在运行时指向不同 memory_resource，因此不必为每种资源改写业务容器代码。'],['单调资源适合阶段性工作','monotonic_buffer_resource 逐步分配，通常不回收单次 deallocate，等整个阶段结束再统一释放。资源必须比使用它的容器活得更久，不能先 release 资源再访问仍在其中的对象。'],['两种语言的边界','本例用 PMR vector 构建一批数据并求和。Python 的 list 版本表达同一计算任务，但 Python 普通列表没有标准的 PMR 分配器接口；不能把 list.clear 解释成与 C++ arena 完全相同的内存行为。']],
 '栈上缓冲区只是初始资源，默认上游仍可能申请更多内存。想禁止回退，应选择 null_memory_resource 并处理 bad_alloc；容量不足不等于容器会自动缩减需求。',
 '本例添加与求和共 O(n) 时间，数据占 O(n) 空间；资源管理策略影响实际分配成本，不改变遍历复杂度。',
 String.raw`#include <iostream>
#include <memory_resource>
#include <vector>
#include <numeric>
int main(){
    std::byte buffer[1024];
    std::pmr::monotonic_buffer_resource arena(buffer,sizeof buffer);
    {
        std::pmr::vector<int> batch(&arena);
        batch.reserve(4);
        for(int x:{2,4,6,8}) batch.push_back(x);
        std::cout<<std::accumulate(batch.begin(),batch.end(),0);
    } // 先析构容器，再析构资源
}`,String.raw`batch = [2, 4, 6, 8]
print(sum(batch))
# Python 示例比较计算语义，不模拟 PMR 的底层分配接口。`, '20',
 ['PMR 的主要用途是？',['自动排序元素','选择容器的内存资源','保证线程安全','消除所有内存开销'],1,'PMR 将分配策略抽象成运行时可选择的 memory_resource。'],
 ['容器仍使用 arena 内的对象时先释放 arena，会有什么问题？',['只会变慢','元素自动复制到堆','对象存储失效，后续访问可能产生未定义行为','编译一定失败'],2,'资源生命周期必须覆盖所有依赖它的对象。'],
 '用 C++17 PMR vector 保存 2、4、6、8 并输出总和 20，保证容器先于内存资源析构。Python 写等价数据处理，解释它为何不是 PMR 实现。');
cite('C++ 标准草案：memory_resource','https://eel.is/c++draft/mem.res');

lesson('stl-node-handle','stl','节点句柄 extract / merge','节点转移 · 改键 · 冲突保留','关联容器',25,
 [['取出一个节点的所有权','C++17 的 extract 将节点从关联容器中取出并返回 node handle。节点暂时不属于容器时，可以修改 map 节点的 key；对容器内的 key 直接修改会破坏排序约束。'],['merge 不等于覆盖','map.merge 将目标能接受的节点转入目标。如果目标已有等价键，相应节点仍留在源容器。转移要求节点类型兼容，并遵守分配器兼容条件。'],['Python 只比较最终映射','Python dict 用 pop 移出条目、按键判断是否转移，可以得到相同的键值结果，但这不等于 C++ 无需拷贝元素的节点所有权转移。示例重命名键 2 为 20，再合并 1 与 3。']],
 '对空 node handle 调用 key 是错误的；extract 前不确定键存在时应先检查 empty。merge 遇到重复键不会覆盖目标值。','以有序 map 为例，单个查找/插入 O(log n)，合并 m 个节点约 O(m log(n+m))；Python dict 对应操作平均 O(1) 每键。',
 String.raw`#include <iostream>
#include <map>
#include <string>
int main(){
    std::map<int,std::string> a{{1,"A"},{2,"B"}}, b{{1,"X"},{3,"C"}};
    auto node=a.extract(2);
    if(!node.empty()){node.key()=20;a.insert(std::move(node));}
    a.merge(b);
    for(auto& [k,v]:a)std::cout<<k<<':'<<v<<' ';
    std::cout<<"\nleft="<<b.size();
}`,String.raw`a, b = {1:'A',2:'B'}, {1:'X',3:'C'}
if 2 in a:
    a[20] = a.pop(2)
for k in list(b):
    if k not in a:
        a[k] = b.pop(k)
print(' '.join(f'{k}:{a[k]}' for k in sorted(a)))
print(f'left={len(b)}')`, '1:A 3:C 20:B\nleft=1',
 ['map.merge 遇到目标已有的键时如何处理？',['覆盖目标','两个节点都删除','冲突节点留在源容器','总是抛出异常'],2,'目标 map 不接受重复键，因此冲突节点保留在源容器。'],
 ['为什么要 extract 后修改 map 的键？',['让节点临时脱离有序容器约束','因为 value 无法修改','保证变成 unordered_map','把查找变成 O(1)'],0,'重新插入时容器才能按照新键建立正确的顺序关系。'],
 '初始 a={1:A,2:B}、b={1:X,3:C}。将 a 的键 2 改为 20，再合并 b；输出 a 的有序键值并确认 b 还剩 1 个冲突节点。');
cite('C++ 标准草案：Node handles','https://eel.is/c++draft/container.node');

lesson('stl-exception-safety','stl','异常安全与提交式更新','基本保证 · 强保证 · 临时副本','资源管理与工程边界',23,
 [['失败后的状态也是接口契约','基本保证要求出错后对象仍满足不变量、资源不泄漏；强保证进一步要求操作失败时可观察状态不变。无抛出保证则要求操作不通过异常报告失败。并非每个容器的每个操作都具有相同保证。'],['先准备，后提交','把可能失败的计算放在临时对象上，全部成功后用安全的交换或替换提交。本例要求所有新值非负；校验失败就抛出异常，原列表保持不变。'],['别在提交前污染旧状态','如果直接向目标逐项写入，写到一半校验失败就可能留下部分修改。C++ 示例使用默认分配器的 vector.swap；Python 示例在校验完之前不修改原列表。']],
 '强保证不是“捕获所有异常然后什么都不做”；正确的资源管理、可安全提交的步骤和元素类型条件缺一不可。','复制和校验 O(n) 时间，临时副本 O(n) 空间；以额外空间换取失败回滚的简单性。',
 String.raw`#include <iostream>
#include <vector>
#include <stdexcept>
void replace_positive(std::vector<int>& dst,const std::vector<int>& src){
    auto tmp=src;
    for(int x:tmp)if(x<0)throw std::invalid_argument("negative");
    dst.swap(tmp);
}
int main(){
    std::vector<int> a{7,8};
    try{replace_positive(a,{1,-2,3});}catch(const std::invalid_argument&){}
    for(int x:a)std::cout<<x<<' ';
}`,String.raw`def replace_positive(dst, src):
    tmp = list(src)
    if any(x < 0 for x in tmp):
        raise ValueError('negative')
    dst[:] = tmp

a = [7,8]
try:
    replace_positive(a, [1,-2,3])
except ValueError:
    pass
print(*a)`, '7 8',
 ['强异常保证主要要求什么？',['任何操作都不抛异常','失败时可观察状态不变','异常自动变成返回值','不允许内存分配'],1,'强保证关注失败后的状态，不禁止异常发生。'],
 ['要实现先准备后提交，哪一步应放在提交前？',['修改原容器每一项','清空原数据','对临时数据完成所有可能失败的校验','销毁目标对象'],2,'潜在失败先发生在临时对象中，原对象不受影响。'],
 '实现仅接受非负整数的新列表替换函数。用 [1,-2,3] 替换 [7,8] 时应报错并保留原列表 [7,8]；成功输入则整体替换。');
cite('C++ 标准草案：容器异常保证要求','https://eel.is/c++draft/container.requirements.general');

lesson('stl-parallel-policy','stl','执行策略与可并行归约','seq / par / par_unseq · 结合律 · 数据竞争','资源管理与工程边界',24,
 [['执行策略描述允许的执行方式','部分标准算法接受 execution policy。seq 表示顺序执行；par 允许并行；par_unseq 还允许同一线程上的无顺序执行。允许并行不等于实现保证使用多个线程，也不等于一定更快。'],['先消除共享副作用','每个元素的变换若写同一计数器，会产生竞争风险。将运算设计成无共享写入的映射，再做合法的归约，更容易推理。浮点加法受舍入影响，重新分组可能改变结果。'],['示例验证计算，不测量并行速度','本例用 seq 执行平方变换和整数求和，输出 30；选用顺序策略便于在不同工具链上运行。Python 写等价映射归约，不宣称突破 GIL 或自动使用多核。']],
 '不要把带执行策略的算法回调当作普通异常传播环境；标准执行策略下某些回调异常会导致 terminate。par_unseq 中阻塞同步还需特别谨慎。','n 个元素的总工作量 O(n)，示例顺序执行；并行开销、可用核心与实现决定实际耗时。',
 String.raw`#include <iostream>
#include <vector>
#include <algorithm>
#include <execution>
#include <numeric>
int main(){
    std::vector<int>a{1,2,3,4},b(a.size());
    std::transform(std::execution::seq,a.begin(),a.end(),b.begin(),[](int x){return x*x;});
    std::cout<<std::reduce(std::execution::seq,b.begin(),b.end(),0);
}`,String.raw`a = [1,2,3,4]
squares = [x*x for x in a]
print(sum(squares))`, '30',
 ['par 策略意味着什么？',['实现被允许并行执行','每次恰好开两个线程','运行时间必定减半','回调可以随意竞争写入'],0,'执行策略给实现提供许可与约束，并不保证特定线程数或性能提升。'],
 ['浮点求和重新分组后可能不同，主要因为？',['排序失效','浮点舍入使加法不严格满足结合律','CPU 不会加法','输入自动去重'],1,'有限精度表示会让不同求值顺序产生不同舍入结果。'],
 '对 [1,2,3,4] 做平方映射并求和，得到 30。C++ 使用 seq 执行策略，Python 使用等价表达式，并说明改为并行策略前应检查的共享副作用。');
cite('C++ 标准草案：并行算法与执行策略','https://eel.is/c++draft/algorithms.parallel');
const dbSetup='CREATE DATABASE IF NOT EXISTS cs_atlas;\nUSE cs_atlas;';
lesson('sql-json','sql','JSON 数据与路径查询','JSON 类型 · 路径表达式 · 生成列','SQL 函数与工程细节',24,
 [['结构化列与半结构化字段','JSON 适合保存结构会变化的文档属性，但经常参与关联、约束和高频检索的业务字段仍需认真建模。MySQL JSON 数据会验证文档语法，不等于所有键都自动具有业务类型约束。'],['路径查询与标量解包','JSON_EXTRACT 用路径定位文档成员；JSON_UNQUOTE 将 JSON 字符串解包为 SQL 字符串。数字参与计算时应明确目标类型，而不是依赖不清晰的隐式转换。'],['为访问模式设计索引','不能仅因为字段是 JSON 就假定所有路径查询都高效。可针对稳定的检索路径设计生成列或适用的函数索引，具体限制依版本和表达式而定。']],
 'SQL NULL、JSON null 与不存在的路径需要区分。本例使用 JSON_OBJECT 生成合法文档，并通过确定存在的路径查询。','示例文档大小固定；真实解析、路径访问和索引成本与文档规模及执行计划有关。',
 ...sqlClients("SELECT JSON_UNQUOTE(JSON_EXTRACT(JSON_OBJECT('lang','cpp','level',2),'$.lang')), CAST(JSON_EXTRACT(JSON_OBJECT('lang','cpp','level',2),'$.level') AS UNSIGNED)"), 'cpp 2',
 ['哪个表达式用于定位 JSON 文档中的成员？',['JSON 路径','ORDER BY 的位置','数据库用户名','TCP 序列号'],0,'如 $.lang 是定位对象成员的 JSON 路径。'],
 ['JSON_EXTRACT 得到 JSON 字符串后，要取得无 JSON 引号的 SQL 字符串可用？',['COUNT(*)','JSON_UNQUOTE','COMMIT','GROUP BY'],1,'JSON_UNQUOTE 负责将 JSON 字符串值解包。'],
 '使用 JSON_OBJECT 构造 lang=cpp、level=2 的文档，查询两个成员，输出 cpp 2。字符串需解包，level 显式转换为整数。',
 "SELECT JSON_UNQUOTE(JSON_EXTRACT(JSON_OBJECT('lang','cpp','level',2),'$.lang')),\nCAST(JSON_EXTRACT(JSON_OBJECT('lang','cpp','level',2),'$.level') AS UNSIGNED);");
cite('MySQL 8.4：JSON 类型','https://dev.mysql.com/doc/refman/8.4/en/json.html',{sqlSetup:dbSetup,outputTestable:false});
lesson('sql-charset','sql','字符集、排序规则与字节长度','utf8mb4 · collation · 字符与字节','SQL 函数与工程细节',22,
 [['编码与比较是两件事','字符集决定字符如何表示，排序规则决定字符序列如何比较和排序。同样的 utf8mb4 数据可以使用不同 collation，大小写、重音敏感性和排序结果可能不同。'],['长度口径需要明确','LENGTH 返回字节数，CHAR_LENGTH 返回字符数。在 utf8mb4 编码下，一个中文字符通常占 3 字节；这仍不等于用户看到的字形数量，因为组合字符和 emoji 序列可能包含多个码点。'],['连接与存储都要一致','客户端连接字符集、表列字符集和业务输入需要正确衔接。把乱码文本重新换一种显示编码不能可靠修复已经错误写入的数据。样例用十六进制构造确定的 UTF-8 字节，避免编辑器编码干扰。']],
 '不要把 utf8mb4 的 4 当作所有字符固定占 4 字节。排序规则变化也可能改变唯一键的等价关系，迁移前要检查冲突。','示例固定长度；真实字符串处理与字节长度相关，排序与比较还受 collation 和索引影响。',
 ...sqlClients("SELECT CHAR_LENGTH(CONVERT(0xE4B8AD USING utf8mb4)), LENGTH(CONVERT(0xE4B8AD USING utf8mb4))"), '1 3',
 ['排序规则 collation 主要影响什么？',['端口分配','字符串比较和排序','事务提交频率','数据库文件数量'],1,'字符集处理表示，collation 定义比较和排序规则。'],
 ['中文字符“中”在 UTF-8 中的 CHAR_LENGTH 和 LENGTH 分别是？',['3 和 1','1 和 1','1 和 3','4 和 4'],2,'该字符是一个字符，对应三个 UTF-8 字节。'],
 '用 CONVERT(0xE4B8AD USING utf8mb4) 构造“中”，分别查询字符长度和字节长度，输出 1 3。说明它为何不代表所有字符都占 3 字节。',
 'SELECT CHAR_LENGTH(CONVERT(0xE4B8AD USING utf8mb4)),\n       LENGTH(CONVERT(0xE4B8AD USING utf8mb4));');
cite('MySQL 8.4：字符集与排序规则','https://dev.mysql.com/doc/refman/8.4/en/charset.html',{sqlSetup:dbSetup,outputTestable:false});
lesson('sql-functions','sql','日期、字符串与条件表达式','日期算术 · COALESCE · CASE','SQL 函数与工程细节',20,
 [['让表达式表达业务规则','SQL 不只是读取列，还能组合字符串、日期与条件。COALESCE 返回第一个非 NULL 参数，CASE 根据条件选择结果；它们是表达式，不需要为每种情况发起单独查询。'],['日期算术交给日期类型','月份天数与闰年不同，给日历日期加一天应使用 DATE_ADD 等日期函数，而不是修改字符串末尾数字。样例从 2024-02-28 加一天，结果是闰日。'],['明确时间语义','DATE、DATETIME、TIMESTAMP 面向不同需求。时区转换、夏令时和会话时区会影响部分时间操作；固定日期示例不使用 NOW，保证两种语言客户端读到相同结果。']],
 'COALESCE 处理 NULL，不会自动把空字符串、0 或字符串 NULL 当作空值。混合分支类型时也要关注类型转换。','固定表达式成本有限；在筛选列上套函数可能影响可用访问路径，需看执行计划。',
 ...sqlClients("SELECT DATE_ADD('2024-02-28', INTERVAL 1 DAY), COALESCE(NULL,'unknown')"), '2024-02-29 unknown',
 ['COALESCE(NULL,0,8) 返回什么？',['NULL','0','8','报错'],1,'0 不是 NULL，因此它是第一个非 NULL 参数。'],
 ['2024-02-28 加一天应得到？',['2024-02-29','2024-03-01','2024-02-30','2025-02-28'],0,'2024 是闰年，二月有 29 天。'],
 '在同一条查询中返回 2024-02-28 加一天的日期，以及 NULL 的默认文本 unknown。预期为 2024-02-29 unknown，使用真实日期函数。',
 "SELECT DATE_ADD('2024-02-28', INTERVAL 1 DAY),\n       COALESCE(NULL,'unknown');");
cite('MySQL 8.4：日期与时间函数','https://dev.mysql.com/doc/refman/8.4/en/date-and-time-functions.html',{sqlSetup:dbSetup,outputTestable:false});
lesson('sql-keyset','sql','分页与游标式查询','LIMIT/OFFSET · 稳定顺序 · Keyset','SQL 函数与工程细节',24,
 [['分页要有稳定顺序','只写 LIMIT 不足以保证每次读取同一批记录。ORDER BY 应包含能确定顺序的键；如果按非唯一字段排序，需要额外的唯一键解决并列情况。'],['跳过很多记录也有成本','OFFSET 很大时，即便只返回一小页，也可能先扫描并跳过大量记录。Keyset pagination 使用上一页最后一个排序键，查询其后的记录，适合顺序翻页。'],['用主键作为最简单的游标','本例按 id 升序，在 id=1 之后取两条学生记录。复杂的复合排序需要保存全部排序键；并发插入和删除下的跨页一致性，还取决于快照与业务要求。']],
 'Keyset 不直接提供“跳到第 1000 页”的随机访问；排序字段可变、方向混合或允许 NULL 时，比较条件需仔细设计。','有适用索引时通常可定位游标后读取一页；真实成本取决于索引、过滤条件与回表，不应宣称永远 O(1)。',
 ...sqlClients('SELECT name, score FROM students WHERE id > ? ORDER BY id LIMIT 2',1), 'Chen 76\nYu 88',
 ['仅写 LIMIT 10 而不指定顺序，能保证固定前十条吗？',['能，永远按插入顺序','能，永远按主键','不能依赖未指定的顺序','只有 Python 能'],2,'返回顺序必须通过 ORDER BY 明确约束。'],
 ['按 id 升序翻页，上页最后 id=20，下页条件应是？',['id < 20','id > 20','id = 20','id IS NULL'],1,'使用严格大于避免重复返回上一页的最后记录。'],
 '在初始化 students 表中，以 id=1 作为上一页游标，按 id 升序取之后两条记录。通过参数绑定传入游标，输出 Chen 76、Yu 88。',
 'SELECT name, score FROM students\nWHERE id > 1 ORDER BY id LIMIT 2;');
cite('MySQL 8.4：LIMIT 查询优化','https://dev.mysql.com/doc/refman/8.4/en/limit-optimization.html',{outputTestable:false});
})();

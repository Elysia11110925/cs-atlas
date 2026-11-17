/* 扩充课程：原创示例；官方目录用于覆盖面核对。 */
(()=>{
const mysql='https://dev.mysql.com/doc/refman/8.4/en/';
const cornell='https://www.cs.cornell.edu/courses/cs4120/2023sp/';
const llvm='https://llvm.org/docs/LangRef.html';
const cpp=(body)=>String.raw`#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <algorithm>
#include <functional>
#include <sstream>
#include <regex>
#include <stdexcept>
using namespace std;
int main(){
`+body+'\n}';
function add(id,cat,title,sub,group,concepts,pit,cost,c,p,out,q1,q2,challenge,source,sql='',setup=''){
 lesson(id,cat,title,sub,group,25,concepts,pit,cost,c,p,out,q1,q2,challenge,sql);
 Object.assign(LESSONS.at(-1),{sources:[[cat==='sql'?'MySQL 8.4 官方参考手册':'编译原理参考资料',source]],codeKind:cat==='sql'&&setup?'database':'simulation',sqlSetup:setup||undefined,outputTestable:!setup});
}
const setup=String.raw`CREATE DATABASE IF NOT EXISTS cs_atlas;
USE cs_atlas;
-- 以下只操作本站专用 demo_ 表；重新执行会重置这些练习数据。
DROP TABLE IF EXISTS demo_sales;
CREATE TABLE demo_sales(id INT PRIMARY KEY, dept VARCHAR(10), amount INT NULL) ENGINE=InnoDB;
INSERT INTO demo_sales VALUES(1,'A',20),(2,'A',30),(3,'B',10),(4,'B',NULL);`;
function query(id,title,sub,group,concepts,pit,cost,sql,out,q1,q2,challenge,chapter,init=setup){
 add(id,'sql',title,sub,group,concepts,pit,cost,...sqlClients(sql),out,q1,q2,challenge,mysql+chapter,sql,init);
}
add('sql-model','sql','关系模型、ER 与范式','函数依赖 · 候选键 · 规范化','建模与基础',
 [['先定义实体和联系','ER 模型把学生、课程等对象建成实体，把选课等多对多联系拆成关联表。关系表的主键区分行，外键表达引用关系；主键不能替代所有业务唯一约束。'],['函数依赖描述约束','X→Y 表示任意两行只要 X 相同，Y 就必须相同。它来自业务规则，不是从当前样本中恰好没有冲突就能证明。通过反复应用依赖可算出属性闭包。'],['逐步消除冗余','1NF 关注关系中的属性值，2NF 排除非主属性对候选键的部分依赖，3NF 进一步约束传递依赖；BCNF 要求非平凡依赖的决定因素是超键。分解还应检查无损连接和依赖保持。']],
 '范式不是越高越快；反规范化应以查询需求为依据，并明确维护一致性的成本。示例只求闭包，不自动证明某个分解无损。','反复扫描依赖直到闭包不变；属性数有限，迭代终止。',
 cpp(String.raw`set<char> closure={'A'}; vector<pair<string,string>> f={{"A","B"},{"B","C"}};
bool changed=true;
while(changed){changed=false;for(auto [left,right]:f){bool ok=true;for(char x:left)ok&=closure.count(x)>0;
if(ok)for(char x:right)changed|=closure.insert(x).second;}}
for(char x:closure)cout<<x;`),
 String.raw`closure={'A'}
fds=[('A','B'),('B','C')]
while True:
    before=set(closure)
    for left,right in fds:
        if set(left)<=closure:
            closure.update(right)
    if before==closure:
        break
print(''.join(sorted(closure)))`, 'ABC',
 ['多对多关系通常如何落到关系表？',['仅一列逗号字符串','增加关联表','删除其中一方','全部放主键'],1,'关联表保存双方键，可以附带该联系自身的属性。'],
 ['A→B、B→C 时，A 的闭包包含？',['仅 A','A、B','A、B、C','仅 C'],2,'传递应用依赖可从 A 得到 B，再得到 C。'],
 '实现属性闭包：起始 {A}，依赖 A→B、B→C，输出 ABC。增添无关依赖 D→E 后结果应不变。','https://www.cs.cornell.edu/courses/cs4320/2021fa/');
LESSONS.at(-1).sources[0][0]='Cornell CS 4320：关系数据库与建模课程';
query('sql-types-null','类型选择与 NULL 三值逻辑','DECIMAL · 时间类型 · UNKNOWN','建模与基础',
 [['按语义选择类型','整数用于计数，DECIMAL 用于需要十进制精度的金额，浮点用于允许舍入的测量。DATETIME 与 TIMESTAMP 的时区语义和范围不同，应结合连接时区及业务要求选择。'],['NULL 表示未知或缺失','NULL 不是 0，也不是空字符串。普通比较遇到 NULL 通常得到 UNKNOWN；WHERE 只保留 TRUE。IS NULL 检测缺失，COALESCE 为显示或计算提供替代值。'],['聚合与缺失值','COUNT(*) 计行，COUNT(column) 只计非 NULL 值。示例分别求 demo_sales 总行数与已知金额数，结果为 4、3，不应把未填金额自动解释成真实零销售。']],
 'NOT IN 子查询若含 NULL，可能得到与你直觉不同的结果；需要明确排除 NULL 或使用相关 NOT EXISTS。','计数通常需访问记录或索引项，具体执行成本由存储引擎和计划决定。',
 'SELECT COUNT(*), COUNT(amount) FROM demo_sales','4 3',
 ['金额通常优先选哪种类型以避免二进制浮点舍入？',['FLOAT','DOUBLE','DECIMAL','BLOB'],2,'DECIMAL 存储精确十进制数，仍需合理设置精度和小数位。'],
 ['WHERE amount = NULL 能正确筛出缺失金额吗？',['能','不能，应使用 IS NULL','只在主键能','必须改成 = 0'],1,'普通比较结果为 UNKNOWN，不会被 WHERE 保留。'],
 '统计练习表总行数和 amount 非空行数，返回 4 3；解释两个 COUNT 为什么不同。','data-types.html');
query('sql-ddl','DDL、主外键与 CHECK 约束','建表 · 参照完整性 · 迁移','建模与基础',
 [['在数据库边界守住约束','PRIMARY KEY 保证行身份，UNIQUE 表达业务唯一性，NOT NULL 禁止缺失。CHECK 校验行内条件，外键要求引用目标存在；这些约束可拦截绕过应用校验的写入。'],['约束与事务不是同一件事','约束说明什么状态合法，事务说明一组修改如何共同提交。许多 DDL 会导致隐式提交，不能把 CREATE/ALTER 直接当成可随意回滚的普通数据更新。'],['用一个小表验证设计','创建 demo_people，主键为 id，name 非空，age 允许为空但非空时不能为负。插入两行后按 id 查询，可在练习库另外尝试重复主键或负年龄观察约束错误。']],
 'CHECK 的 UNKNOWN 结果不会像 FALSE 一样拒绝行，因此需要禁止 NULL 时还要声明 NOT NULL。','DDL 可能涉及元数据锁、表重建或后台工作；上线前应评估具体 ALTER 的算法与锁。',
 'SELECT name, age FROM demo_people ORDER BY id','Lin 20\nYu 22',
 ['防止同一 id 出现两次通常使用？',['ORDER BY','PRIMARY KEY','LIMIT','AVG'],1,'主键组合要求唯一且非空。'],
 ['CHECK(age>=0) 是否单独禁止 NULL？',['一定禁止','不一定，需 NOT NULL','只禁止 0','自动改为 0'],1,'NULL 产生 UNKNOWN，想禁止缺失要独立设置非空约束。'],
 '在专用练习库建立 id 主键、name 非空、age 非负的表，插入 Lin/20 与 Yu/22，并按 id 查询。','create-table.html',
 String.raw`CREATE DATABASE IF NOT EXISTS cs_atlas; USE cs_atlas;
DROP TABLE IF EXISTS demo_people;
CREATE TABLE demo_people(id INT PRIMARY KEY,name VARCHAR(30) NOT NULL,age INT CHECK(age>=0)) ENGINE=InnoDB;
INSERT INTO demo_people VALUES(1,'Lin',20),(2,'Yu',22);`);
query('sql-crud','INSERT、UPDATE 与 DELETE','条件更新 · 影响行数 · 批量写入','建模与基础',
 [['写入必须定义目标','INSERT 新增行，UPDATE 改已有行，DELETE 删除满足条件的行。UPDATE 和 DELETE 缺少 WHERE 可能影响整张表，练习前应先用相同条件 SELECT 检查目标范围。'],['区分更新和覆盖','SET amount=amount+5 是基于现值的增量更新；SET amount=5 是覆盖。应用可结合主键和旧版本号做乐观并发控制，并核对受影响行数。'],['验证写入后的状态','初始化脚本在 demo_sales 插入 id=5，给 id=1 加 5，再删去 id=5。最终按 id 查看前两行，金额应为 25 与 30。脚本每次重置专用表后再做写入。']],
 '受影响行数的“匹配行/实际变化行”口径可能受连接选项影响；不应脱离驱动语义推断业务成功。','带主键条件通常定位少量记录，批量写入还要考虑日志、锁、网络往返。',
 'SELECT id, amount FROM demo_sales WHERE id<=2 ORDER BY id','1 25\n2 30',
 ['想给已有金额加 5，应写？',['SET amount=5','SET amount=amount+5','SET amount=NULL','ORDER BY 5'],1,'表达式引用当前列值，执行增量修改。'],
 ['UPDATE 缺少 WHERE 时一般会？',['只更新第一行','更新所有匹配行，此时是全表','自动拒绝','不更新'],1,'除额外安全模式等限制外，未设条件的 UPDATE 会作用于所有行。'],
 '执行初始化中的新增、增量更新与删除后查询 id≤2 的行，应输出 1 25、2 30。','update.html',setup+"\nINSERT INTO demo_sales VALUES(5,'C',9);\nUPDATE demo_sales SET amount=amount+5 WHERE id=1;\nDELETE FROM demo_sales WHERE id=5;");
query('sql-subquery','子查询、EXISTS 与半连接','标量 · 相关子查询 · 反连接','数据查询',
 [['子查询有不同形状','标量子查询应返回至多一行一列，IN 与集合成员关系有关，EXISTS 只关心是否存在行。相关子查询会引用外层列，但优化器不一定按朴素逐行方式执行。'],['用存在性表达需求','查找所在部门有一笔金额至少 25 的销售记录：外层保留部门相同的行，EXISTS 内部寻找见证。A 部门有 30，因此 id=1、2 均被保留。'],['注意反连接的 NULL','NOT EXISTS 判断没有满足条件的行，与包含 NULL 的 NOT IN 并不总等价。编写反连接前先定义缺失值的业务语义。']],
 '标量子查询返回多行会报错；不要用无 ORDER BY 的 LIMIT 1 随意掩盖数据模型问题。','可能被优化为半连接、物化或其他计划，需结合 EXPLAIN 观察。',
 'SELECT s.id,s.dept FROM demo_sales s WHERE EXISTS (SELECT 1 FROM demo_sales t WHERE t.dept=s.dept AND t.amount>=25) ORDER BY s.id','1 A\n2 A',
 ['EXISTS 主要关注子查询的什么？',['第一列值','是否至少返回一行','列名长度','全部排序顺序'],1,'EXISTS 是存在性判断。'],
 ['A 部门有 20 和 30，两条外层行查“同部门是否有金额≥25”，保留几行？',['0','1','2','3'],2,'两行都能在部门内找到金额 30 这一见证。'],
 '使用相关 EXISTS 查询所属部门至少存在一条 amount≥25 的记录，输出 id 和部门，结果为 1 A、2 A。','subqueries.html');
query('sql-union','UNION 与集合运算','去重 · UNION ALL · 列对齐','数据查询',
 [['纵向拼接结果','UNION 将同列数的查询结果合并并消除重复行；UNION ALL 保留重复。它们是纵向合并结果，不是 JOIN 那样横向拼接匹配行。'],['对应位置决定兼容性','两侧列按位置匹配，需要兼容类型，结果列名通常来自第一侧。不同列顺序即使都能转换类型，也可能悄悄改变语义。'],['最终排序放到最外层','集合结果本身没有稳定顺序。示例把 A 部门与金额至少 20 的查询合并，两边都选中 id=1、2；UNION 最终各保留一次。']],
 '只要重复有意义就使用 UNION ALL；为了“保险”无条件去重可能隐藏重复数据来源，也增加成本。','UNION 去重可能需要临时结构，UNION ALL 通常省去这一步，但最终排序仍有成本。',
 "SELECT id,dept FROM demo_sales WHERE dept='A' UNION SELECT id,dept FROM demo_sales WHERE amount>=20 ORDER BY id",'1 A\n2 A',
 ['保留重复行应选？',['UNION ALL','UNION','DISTINCT','GROUP BY'],0,'UNION ALL 直接合并，不执行集合去重。'],
 ['两个结果均为 (1,A),(2,A)，UNION 后有几行？',['1','2','3','4'],1,'重复的完整行各保留一份。'],
 '把 A 部门查询与 amount≥20 查询使用 UNION 合并，再按 id 排序；改用 UNION ALL 比较重复行。','union.html');
query('sql-window','窗口函数与组内排名','OVER · PARTITION · 行与组','数据查询',
 [['聚合但不压缩原行','窗口函数在一个窗口上计算，并把结果附加到原行。GROUP BY 往往把一组压缩为一行，窗口函数则保留每个参与记录。'],['分组范围与排序规则','PARTITION BY 指定独立分区，ORDER BY 指定分区内顺序。ROW_NUMBER 给连续编号；RANK 对并列留空位，DENSE_RANK 对并列不留空位。'],['让并列顺序可重现','示例按部门分区、amount 降序、id 升序编号。id 是稳定的决胜键；金额相同时如果不给决胜键，ROW_NUMBER 对这些行的顺序可能不确定。']],
 '窗口 ORDER BY 不等于最终结果 ORDER BY。累计 SUM 还需看清 ROWS/RANGE 窗口框架；并列排序键会影响默认框架。','通常涉及分区与排序，实际成本由数据规模、索引与窗口计划决定。',
 'SELECT id, ROW_NUMBER() OVER(PARTITION BY dept ORDER BY amount DESC,id) AS rn FROM demo_sales ORDER BY id','1 2\n2 1\n3 1\n4 2',
 ['窗口函数通常会把每组压成一行吗？',['一定会','通常保留原行','只能返回一行','只能用于主键'],1,'窗口结果附在原行上，和普通 GROUP BY 的输出粒度不同。'],
 ['分数 90,90,80 的 DENSE_RANK 是？',['1,2,3','1,1,3','1,1,2','0,0,1'],2,'密集排名对并列只占一个等级，不跳过下一名次。'],
 '对 demo_sales 按部门分区，金额降序、id 升序生成 ROW_NUMBER，最终按 id 输出 id 与编号。','window-functions.html');
query('sql-cte','CTE 与递归查询','WITH · 锚点 · 终止条件','数据查询',
 [['给中间结果一个名字','普通 CTE 可把复杂查询拆为命名步骤，提高可读性；它不承诺一定物化，也不是持久化的表。一次语句结束后名称即失效。'],['递归从锚点出发','递归 CTE 由非递归锚点和引用自身的递归部分组成。示例从 n=1 开始，每轮得到 n+1，并仅让 n<5 的行继续扩展。'],['终止和类型都是设计问题','图或组织树查询要处理循环，不能只希望数据永远无环。递归列类型由非递归部分等规则确定，字符串拼接路径时要预留足够宽度。']],
 '服务器有递归深度等限制；提高限制不能修复缺少终止条件的递归。','本例生成 n 个数为 O(n) 行处理；复杂递归还取决于连接与去重。',
 'WITH RECURSIVE seq(n) AS (SELECT 1 UNION ALL SELECT n+1 FROM seq WHERE n<5) SELECT n,n*n FROM seq ORDER BY n','1 1\n2 4\n3 9\n4 16\n5 25',
 ['递归 CTE 的非递归部分通常称为？',['索引','锚点','外键','视图授权'],1,'锚点提供递归展开的初始行。'],
 ['从 1 开始，只在 n<5 时生成 n+1，最终最大 n 是？',['4','5','6','无限'],1,'n=4 可生成 5，n=5 不再继续。'],
 '用 WITH RECURSIVE 生成 1 到 5，并输出数字及平方；解释为什么不会产生 6。','with.html');
query('sql-index','B+树、联合索引与覆盖索引','聚簇 · 最左前缀 · 回表','索引与执行计划',
 [['索引是一种额外访问路径','InnoDB 聚簇索引叶节点保存行数据，二级索引记录包含主键信息，可能需要再访问聚簇索引取其他列。索引提高某些读取效率，也增加写入、空间和维护成本。'],['联合键按字典序组织','索引 (dept,amount,id) 先按 dept，再按 amount，再按 id 排列。固定 dept 后对 amount 做范围查询，通常形成连续区间；只有 amount 条件不等价于同样有效的最左前缀定位。'],['覆盖可以减少额外访问','如果查询需要的列都能从索引获取，就可能使用覆盖索引。示例按 dept=A、amount≥20 取 id 和 amount，并保持金额与 id 的顺序。是否实际选它要看优化器判断。']],
 '“最左前缀”是理解复合访问路径的原则，不表示优化器在任何版本和数据分布下都绝不使用其他索引策略。','点查常用树高估算；范围查询还需扫描命中项，不能统一写成 O(log n)。',
 "SELECT id,amount FROM demo_sales WHERE dept='A' AND amount>=20 ORDER BY amount,id",'1 20\n2 30',
 ['二级索引覆盖查询的好处之一是？',['永远零 IO','可能减少回表','不再维护索引','自动消除锁'],1,'需要的数据在该索引中即可得到时可减少额外行访问。'],
 ['索引 (dept,amount) 固定 dept 后，对 amount 范围查询通常如何定位？',['连续键区间','随机全表每列','只能用哈希','不能查询'],0,'联合键按字典序排列，同一 dept 的 amount 有序。'],
 '建立 (dept,amount,id) 索引，查询 A 部门金额至少 20 的 id 和 amount。另用 EXPLAIN 检查计划，不把索引选择写成硬性保证。','multiple-column-indexes.html',setup+'\nCREATE INDEX demo_idx ON demo_sales(dept,amount,id);');
query('sql-view','视图与查询封装','逻辑视图 · 权限 · 更新限制','数据库对象',
 [['把查询保存成接口','普通视图存储查询定义，而不是自动保存一份结果快照。它可以向应用暴露稳定的列集合，降低应用对底层表结构的直接依赖。'],['更新能力有条件','简单视图可能可更新，聚合、分组或复杂结构可能限制更新。WITH CHECK OPTION 可约束经由视图的写入仍符合视图条件，但不能代替所有表级约束。'],['安全要看执行身份','SQL SECURITY DEFINER 与 INVOKER 影响权限检查上下文，设计者应清楚谁有权访问底层对象。示例视图只暴露金额至少 20 的 id 与 amount。']],
 '视图不是自动的性能缓存；执行成本取决于展开或物化等实际策略。','与底层查询计划有关，不能把读取视图视为常数时间。',
 'SELECT id,amount FROM demo_high_sales ORDER BY id','1 20\n2 30',
 ['普通视图主要保存什么？',['查询定义','所有查询结果快照','数据库密码','二进制日志'],0,'普通视图是命名查询，是否物化执行不等于持久保存结果。'],
 ['含 GROUP BY 的视图是否一定可直接更新？',['一定可以','不一定且常受限制','自动改所有行','只能通过 LIMIT'],1,'视图可更新性受定义结构和数据库规则约束。'],
 '建立筛选 amount≥20 的视图，只暴露 id 和 amount，再查询得到 1 20、2 30。','views.html',setup+'\nCREATE OR REPLACE VIEW demo_high_sales AS SELECT id,amount FROM demo_sales WHERE amount>=20;');
query('sql-routine','存储过程与存储函数','参数 · 局部逻辑 · 调用边界','数据库对象',
 [['把稳定逻辑放到服务端','存储过程可封装多条语句并由 CALL 调用，存储函数通常在表达式中返回一个值。是否放入数据库应权衡网络往返、部署方式、权限、可测试性和可维护性。'],['参数与错误处理','过程可有 IN、OUT、INOUT 参数，复合语句可以声明局部变量与处理器。业务事务的提交边界应明确，不能让调用方误以为一个函数调用天然等于完整事务。'],['先理解最小函数','这里创建 demo_tax(x)，返回 x 的两倍作为函数语法演示，并查询输入 7 得到 14。它并非真实税率计算，选择确定性纯函数避免把网络或时钟行为混入示例。']],
 '创建存储函数需要相应权限，启用二进制日志时还可能受函数声明与服务器策略限制；不要为做练习随意放宽生产权限。','函数被每行调用时会累积成本；示例单次整数计算为 O(1)。',
 'SELECT 7 AS input_value,demo_tax(7) AS output_value','7 14',
 ['通常调用存储过程使用什么语句？',['CALL','DESCRIBE','VACUUM','MERGE'],0,'CALL 用来调用存储过程；函数可出现在表达式中。'],
 ['确定性函数的含义最接近？',['永不报错','相同输入得到相同结果','一定零开销','一定无权限限制'],1,'确定性描述输入与输出关系，不是性能或权限保证。'],
 '在练习库创建纯函数 demo_tax(x) 返回 2*x，再查询输入 7 与输出 14；这只是函数机制演示。','stored-routines.html',
 String.raw`CREATE DATABASE IF NOT EXISTS cs_atlas; USE cs_atlas;
DROP FUNCTION IF EXISTS demo_tax;
CREATE FUNCTION demo_tax(x INT) RETURNS INT DETERMINISTIC NO SQL RETURN x*2;`);
query('sql-trigger','触发器与派生字段','BEFORE · AFTER · NEW/OLD','数据库对象',
 [['由数据事件触发','触发器响应表上的 INSERT、UPDATE 或 DELETE，可在事件前后执行逻辑。它适用于某些跨写入口的统一维护，但会让写操作的实际工作不再只由外层 SQL 决定。'],['区分新旧行','NEW 表示新行值，OLD 表示旧行值，可用范围取决于事件类型。BEFORE INSERT 可以设置 NEW 的派生字段；AFTER 常用于依赖已发生事件的处理。'],['一个可观察的派生值','demo_line 的 amount 在插入前由 price*qty 计算。插入单价 7、数量 3 后查询金额为 21。实际订单还需小数金额、舍入和库存事务等设计。']],
 '触发器应避免隐藏昂贵操作；多行语句会对涉及的行触发相应处理，不要按一次语句只执行一次估算。','每行触发开销累积；本例每行计算 O(1)。',
 'SELECT id,amount FROM demo_line ORDER BY id','1 21',
 ['BEFORE INSERT 中 NEW 通常表示？',['将要插入的新行','被删除的旧行','另一张表','事务日志'],0,'NEW 用于访问或在允许场景下设置新行值。'],
 ['每行触发器插入 100 行时，不能假设什么？',['会有新增行','触发逻辑只执行一次','存在 NEW','需要权限'],1,'行级触发器的成本随被处理行数量增加。'],
 '建立 BEFORE INSERT 触发器令 amount=price*qty，插入 (id=1,price=7,qty=3)，查询得到 1 21。','triggers.html',
 String.raw`CREATE DATABASE IF NOT EXISTS cs_atlas; USE cs_atlas;
DROP TABLE IF EXISTS demo_line;
CREATE TABLE demo_line(id INT PRIMARY KEY,price INT,qty INT,amount INT);
CREATE TRIGGER demo_line_calc BEFORE INSERT ON demo_line FOR EACH ROW SET NEW.amount=NEW.price*NEW.qty;
INSERT INTO demo_line(id,price,qty) VALUES(1,7,3);`);
query('sql-partition','分区表与分区裁剪','RANGE · 键限制 · 管理成本','运维与架构',
 [['把一个逻辑表拆成物理分区','分区可以按范围、列表、哈希等规则分配记录。它有助于按时间等维度管理数据生命周期，但不是自动把所有查询并行化或加速的开关。'],['裁剪依赖可推导的条件','若条件能确定只需访问某些分区，优化器可裁剪其他分区。WHERE 与分区键之间的关系越清楚，越容易推导；仍应使用 EXPLAIN 验证实际访问分区。'],['设计唯一键时考虑限制','MySQL 分区表的唯一键与分区表达式存在约束。示例用 id 主键并按 id 分区，查询 id≥10 得到 id=12 的记录，避免引入与分区键无关的唯一约束。']],
 '分区不能代替合适索引，也不能代替备份。删除分区会删除其中的数据。','收益取决于裁剪效果与各分区访问路径；维护过多分区也有开销。',
 'SELECT id,amount FROM demo_partition WHERE id>=10 ORDER BY id','12 30',
 ['分区裁剪的主要目的是什么？',['跳过无关分区','自动取消所有索引','消除 NULL','替代备份'],0,'通过条件推导减少需要访问的分区。'],
 ['按 id 分区的表，只查询 amount 条件一定能裁剪吗？',['一定','不一定','一定删除分区','一定只查第一分区'],1,'条件未必能推导出分区键范围。'],
 '建立按 id<10 与其余值分区的练习表，插入 id=1 和 12；查询 id≥10，输出 12 30。','partitioning.html',
 String.raw`CREATE DATABASE IF NOT EXISTS cs_atlas; USE cs_atlas;
DROP TABLE IF EXISTS demo_partition;
CREATE TABLE demo_partition(id INT PRIMARY KEY,amount INT) ENGINE=InnoDB
PARTITION BY RANGE(id)(PARTITION p0 VALUES LESS THAN(10),PARTITION p1 VALUES LESS THAN MAXVALUE);
INSERT INTO demo_partition VALUES(1,20),(12,30);`);
query('sql-security','用户权限、参数化与 SQL 注入','最小权限 · 角色 · 值绑定','运维与架构',
 [['权限按职责分配','应用账号只获得所需库表和操作权限，管理与只读分析使用不同身份。角色可组织一组权限，账户的主机部分也是身份匹配的一部分。练习客户端的 root 只是本机示例，不应作为应用部署方案。'],['输入是数据，不是 SQL 结构','占位符绑定值，让驱动区分 SQL 模板与参数，避免把字符串引号和运算符作为用户输入的一部分拼入语句。动态表名、排序方向不能简单用值占位符替换，应使用允许列表。'],['保护连接与秘密','远程连接应配置证书校验的 TLS，密码从受控秘密存储读取，不应写入源码。审计、备份权限和网络访问控制共同组成防线，参数绑定只解决其中一个问题。']],
 '仅删除单引号不能防止所有 SQL 注入。示例把阈值作为整数参数绑定，其他 SQL 结构固定。','权限检查与连接建立有成本；安全设计不能只用查询耗时衡量。',
 'SELECT id,amount FROM demo_sales WHERE amount>=? ORDER BY id','1 20\n2 30',
 ['用户输入的值应优先通过什么传入查询？',['直接拼接','占位符绑定','删除空格','转大写'],1,'绑定值可避免其被解释为 SQL 结构。'],
 ['动态 ORDER BY 方向 ASC/DESC 适合如何处理？',['把任意输入原样拼入','仅允许预定义的 ASC/DESC','改成密码','用数字 0 替代'],1,'结构性片段需要严格允许列表，不能用值绑定替代任意语法。'],
 '使用参数化查询筛选 amount≥20，输出 id 与 amount；说明为什么列名与排序方向还需要允许列表。','security.html');
// 本节使用参数绑定；覆盖 query() 默认无参数的客户端。
{const l=LESSONS.at(-1);[l.cpp,l.python]=sqlClients(l.sql,20);Object.assign(l.questions[2],{cpp:l.cpp,python:l.python});}
add('sql-explain','sql','EXPLAIN、统计信息与成本选择','估算行数 · 实际执行 · 慢查询','索引与执行计划',
 [['计划说明如何访问数据','EXPLAIN 展示优化器选择的访问路径、连接顺序等信息。估算不是实测；EXPLAIN ANALYZE 会执行被支持的查询，分析时必须知道它会产生实际工作。'],['成本模型用于比较方案','优化器利用统计信息估计访问行数和不同操作代价。索引并非总优于扫描：命中比例很高、回表很多时，顺序扫描可能更合适。本节用人为成本计算说明比较过程。'],['先测量再优化','从慢查询日志或 Performance Schema 找到真实高成本语句，检查扫描行数、排序、临时结果和锁等待。修改后用代表性数据对比；不要只凭 SQL 字符串长度判断速度。']],
 '示例成本是教学数字，并非 MySQL 优化器公式。真正计划随统计信息、版本、参数和数据分布改变。','本例比较 k 个候选计划 O(k)，实际优化器搜索复杂得多。',
 cpp(String.raw`int rows=1000,matches=20; int scan=rows, index=10+matches*4;
cout<<(index<scan?"index":"scan")<<' '<<min(index,scan);`),
 String.raw`rows,matches=1000,20
scan=rows
index=10+matches*4
print('index' if index<scan else 'scan',min(index,scan))`,'index 90',
 ['EXPLAIN 的估算行数一定等于实际行数吗？',['一定','不一定','永远为零','只由列名决定'],1,'统计信息和选择率估算可能存在误差。'],
 ['扫描成本1000，索引固定10加20次每次4，较低成本是？',['1000','90','80','1010'],1,'10+20×4=90，小于扫描成本。'],
 '实现教学计划选择器，比较 scan=1000 与 index=10+20×4，输出 index 90；将匹配数改为300，观察选择变为 scan。',mysql+'using-explain.html');
add('sql-innodb','sql','InnoDB、页与缓冲池','存储引擎 · 缓存 · 脏页','事务与存储引擎',
 [['存储引擎承担物理管理','MySQL 服务层处理连接与 SQL 等工作，InnoDB 管理表的存储、索引、事务及锁等。页是重要的缓存和 IO 管理单位，读取一行可能涉及多个索引页。'],['缓存减少重复读取','缓冲池保存经常访问的数据页，命中可避免对应的磁盘读取。写入在内存中形成脏页，之后按刷脏策略写回；提交日志与数据页写回不是同一个步骤。'],['理解缓存替换的直觉','本节用容量2的简化 LRU 缓存处理页面1、2、1、3。第三次访问1命中，访问3淘汰最久未用的2，最终从新到旧为3、1。真正 InnoDB 使用比朴素 LRU 更复杂的管理策略。']],
 '模拟不等于 InnoDB 实现；实际还有预读、年轻/旧页分区、刷脏和并发控制。','这里用数组维护顺序，每次 O(capacity)；哈希表加链表可实现平均 O(1)。',
 cpp(String.raw`vector<int> cache;int hits=0;
for(int x:{1,2,1,3}){auto p=find(cache.begin(),cache.end(),x);if(p!=cache.end()){++hits;cache.erase(p);}cache.insert(cache.begin(),x);if(cache.size()>2)cache.pop_back();}
cout<<hits<<' ';for(int x:cache)cout<<x<<' ';`),
 String.raw`cache=[]
hits=0
for x in [1,2,1,3]:
    if x in cache:
        hits+=1
        cache.remove(x)
    cache.insert(0,x)
    if len(cache)>2:
        cache.pop()
print(hits,*cache)`,'1 3 1',
 ['缓冲池的作用之一是？',['删除事务','复用内存中的数据页','自动免除备份','替代所有索引'],1,'缓存热点页减少重复磁盘读取。'],
 ['容量2的LRU依次访问1、2、1、3，最后淘汰哪个页？',['1','2','3','全部'],1,'第二次访问1使其变新，2成为最久未访问页。'],
 '实现教学LRU页缓存，容量2，访问1、2、1、3；输出命中次数1和最终从新到旧的3、1。',mysql+'innodb-buffer-pool.html');
add('sql-isolation','sql','隔离级别与并发异常','读已提交 · 可重复读 · 串行化','事务与存储引擎',
 [['并发事务看到什么','读未提交、读已提交、可重复读和串行化约束不同的并发观察。需要区分脏读、不可重复读和幻读，并且结合具体数据库的锁与 MVCC 机制理解实现，不能只背表格。'],['快照的建立时机','InnoDB 普通一致性读在读已提交下通常每条语句取新快照，可重复读下复用事务内首次一致性读建立的快照。锁定读和写操作采用不同的读取规则。'],['观察两次读取','教学调度为：先读已提交值10，其他事务提交20，再读一次。读已提交模型得到10、20，固定快照模型得到10、10。这里没有模拟锁定读或真正并发线程。']],
 '“可重复读永远看不到新值”过于绝对；锁定读、自己的写入等场景需要单独分析。','实际成本包括版本读取、锁等待与冲突重试，本模型为常数时间。',
 cpp(String.raw`int committed=10;int snapshot=committed,first=committed;committed=20;
cout<<"RC "<<first<<' '<<committed<<'\n'<<"RR "<<snapshot<<' '<<snapshot;`),
 String.raw`committed=10
snapshot=first=committed
committed=20
print('RC',first,committed)
print('RR',snapshot,snapshot)`,'RC 10 20\nRR 10 10',
 ['读到其他事务尚未提交的数据称为？',['脏读','覆盖索引','分区裁剪','外键级联'],0,'脏读可能读到稍后被回滚的数据。'],
 ['本节固定快照10，其他事务提交20后，快照读再读得到？',['0','10','20','随机'],1,'固定快照模型保留原可见版本，仍读到10。'],
 '模拟先读10、随后他人提交20，再读一次，分别输出读已提交与固定快照模型的结果。',mysql+'innodb-transaction-isolation-levels.html');
add('sql-mvcc','sql','MVCC、Read View 与版本链','快照 · 旧版本 · 清理','事务与存储引擎',
 [['记录可以有多个历史版本','MVCC 允许读者按可见性规则读取适当版本，而不是总读取当前最新内容。InnoDB 使用事务标识与回滚信息等维护版本可见性，减少一些读写之间的阻塞。'],['可见性不只比较时间戳','真实 Read View 涉及创建视图时的活动事务集合和边界，不能简化成“事务号小就一定可见”。本节特意使用已经提交的单调版本号模型，只练习向旧版本查找。'],['历史不能无限保留','长事务持续需要旧版本时，清理可能受到影响，增加历史版本与存储压力。尽快结束不再需要的事务是数据库维护的一部分。']],
 '本例的 cutoff 不是 MySQL Read View 实现，只是演示“挑出可见的最近版本”。','线性版本链最坏 O(v)，v 为需要检查的版本数量。',
 cpp(String.raw`vector<pair<int,int>> versions={{3,30},{2,20},{1,10}};int cutoff=2;
for(auto [id,value]:versions)if(id<=cutoff){cout<<value;break;}`),
 String.raw`versions=[(3,30),(2,20),(1,10)]
cutoff=2
print(next(value for version,value in versions if version<=cutoff))`,'20',
 ['MVCC 读取可能使用什么？',['适当的历史版本','只允许最新值','只能读 NULL','只能读主键'],0,'读取的版本由可见性规则决定。'],
 ['已提交版本按新到旧为3:30、2:20、1:10，模型cutoff=2，应读？',['30','20','10','无值'],1,'跳过版本3，选择最近的可见版本2。'],
 '在简化已提交版本链中寻找不超过cutoff的最新版本，给定[(3,30),(2,20),(1,10)]、cutoff=2，输出20。',mysql+'innodb-multi-versioning.html');
add('sql-deadlock','sql','锁、间隙与死锁检测','共享/排他 · 等待图 · 重试','事务与存储引擎',
 [['锁保护不兼容的并发操作','共享与排他锁具有不同兼容性。InnoDB 的记录锁、间隙锁及 next-key 锁与索引访问和隔离级别有关，锁定范围不能只看返回了几行。'],['死锁是等待形成环','T1 持有资源A等待B，T2持有B等待A，就可能形成死锁。检测器可选择一个事务回滚，使其余事务继续。应用需要把死锁作为可处理的事务失败。'],['用等待图练习检测','把事务看成顶点，等待关系T1→T2看成有向边。深度优先搜索中遇到仍在递归栈的节点便检测到环。真实引擎检测还涉及资源与锁细节。']],
 '固定资源获取顺序可减少死锁，但不能保证所有系统永不死锁。重试应重试整个事务，并防止重复业务副作用。','等待图 DFS 为 O(V+E) 时间、O(V) 空间。',
 cpp(String.raw`vector<vector<int>> g={{1},{0}};vector<int> color(2);
function<bool(int)> dfs=[&](int u){color[u]=1;for(int v:g[u]){if(color[v]==1)return true;if(color[v]==0&&dfs(v))return true;}color[u]=2;return false;};
bool cycle=false;for(int i=0;i<2;++i)if(!color[i])cycle|=dfs(i);cout<<boolalpha<<cycle;`),
 String.raw`g=[[1],[0]]
color=[0]*len(g)
def dfs(u):
    color[u]=1
    for v in g[u]:
        if color[v]==1 or (color[v]==0 and dfs(v)):
            return True
    color[u]=2
    return False
print(str(any(color[u]==0 and dfs(u) for u in range(len(g)))).lower())`,'true',
 ['死锁等待图的典型特征是？',['有向环','顶点有序','没有边','只有一个主键'],0,'循环等待构成死锁分析的关键结构。'],
 ['T1等T2、T2等T1，应用收到死锁回滚后应优先考虑？',['只重做最后一行SQL','按业务策略重试完整事务','关闭所有约束','忽略扣款状态'],1,'事务失败后需重新建立完整业务操作的原子性。'],
 '对等待图0→1、1→0检测环，输出true；删掉1→0后应输出false。',mysql+'innodb-deadlocks.html');
add('sql-logs','sql','redo、undo 与 binlog','恢复 · 回滚 · 复制日志','事务与存储引擎',
 [['不同日志承担不同职责','redo 支持崩溃恢复时重做存储层修改，undo 支持回滚和旧版本读取，binlog 记录服务器层数据变更事件并用于复制及时间点恢复。三者不能简单互相替代。'],['写前日志与持久性','日志持久化顺序与数据页写回策略共同影响恢复正确性。提交是否经得住某类故障还依赖日志刷盘、操作系统与存储设备的保证。'],['用前后镜像理解方向','教学模型将余额10更新为15，保存before=10、after=15。撤销使用before恢复10，重做使用after恢复15。实际日志格式和恢复算法远比两个整数复杂。']],
 '不能把本例的前后镜像当作真实 InnoDB redo/undo 编码；它只解释撤销与重做的方向。','本例 O(1)；真实恢复耗时受日志量、脏页与IO影响。',
 cpp(String.raw`int page=10,before=page,after=15;page=after;
page=before;cout<<"undo "<<page<<'\n';page=after;cout<<"redo "<<page;`),
 String.raw`page=10
before,after=page,15
page=after
page=before
print('undo',page)
page=after
print('redo',page)`,'undo 10\nredo 15',
 ['用于复制和时间点恢复的重要服务器层日志是？',['binlog','仅应用控制台输出','网页缓存','浏览器历史'],0,'二进制日志记录可供复制和恢复的数据变更事件。'],
 ['10更新为15，撤销应恢复？',['25','15','10','0'],2,'撤销回到修改前的10，重做则应用修改后的15。'],
 '保存修改10→15的前后镜像，分别模拟undo和redo，输出undo 10与redo 15。',mysql+'innodb-redo-log.html');
add('sql-recovery','sql','备份、恢复与 PITR','全量 · 日志回放 · 恢复演练','运维与架构',
 [['备份的价值在于可恢复','逻辑备份导出结构与数据，物理备份复制存储文件并处理一致性。是否完整、是否能解密、依赖的日志是否保留，都决定真正的恢复能力。'],['时间点恢复从一致基线开始','先恢复某个一致备份，再把后续日志按正确顺序回放到目标时间或位置。目标应避开误操作事件，且要验证事务边界，不能机械地在任意字节截断。'],['定义恢复目标','RPO 描述能容忍的数据丢失范围，RTO 描述可容忍的恢复时间。演练应验证业务数据和应用，而不仅检查备份文件存在。示例只回放截止时间内的增量事件。']],
 '复制不是备份：误删也可能被复制过去。示例使用整数余额与事件时间，不是实际mysqlbinlog工具。','回放 k 条事件为 O(k)，实际还依赖索引、事务与磁盘。',
 cpp(String.raw`int value=100,target=20;vector<pair<int,int>> events={{10,5},{20,-3},{30,-100}};
for(auto [time,delta]:events)if(time<=target)value+=delta;cout<<value;`),
 String.raw`value=100
events=[(10,5),(20,-3),(30,-100)]
target=20
for time,delta in events:
    if time<=target:
        value+=delta
print(value)`,'102',
 ['RPO 更接近描述什么？',['容许的数据丢失范围','CPU频率','SQL列数','浏览器数量'],0,'RPO关注恢复点与数据丢失，而RTO关注恢复时间。'],
 ['基线100，时间10加5、20减3、30误减100，恢复到20得到？',['2','100','102','105'],2,'只回放前两条事件，100+5-3=102。'],
 '回放日志直到目标时间20：基线100，事件(10,+5),(20,-3),(30,-100)，输出102。',mysql+'backup-and-recovery.html');
add('sql-replication','sql','复制、GTID 与高可用','已接收/已执行 · 延迟 · 切换','运维与架构',
 [['复制把变更传到另一个节点','源端的变更经传输和应用阶段在副本重现。异步复制可能落后，刚写入源端后立即从副本读不一定看到新值，读写分离需要明确一致性需求。'],['身份与执行进度','GTID 为事务赋予全局标识，便于记录已执行事务和定位所需增量。真实GTID包含服务器标识与事务序号等结构；本节用整数集合简化“已接收减已执行”的待应用集合。'],['切换不是改一个连接地址','高可用还要处理仲裁、防止双主写入、客户端重连和故障恢复。半同步、组复制等机制也有具体语义和部署条件，不能笼统承诺零数据丢失。']],
 '副本正常连接不代表已追平；应分别观察传输、应用与业务层延迟。集合模型不实现真实复制协议。','集合差集为 O(n log n) 的示例实现，哈希实现可平均线性。',
 cpp(String.raw`set<int> received={1,2,3,4},executed={1,2};for(int id:received)if(!executed.count(id))cout<<id<<' ';`),
 String.raw`received={1,2,3,4}
executed={1,2}
print(*sorted(received-executed))`,'3 4',
 ['异步副本是否保证每次读都立即看到源端刚提交的值？',['保证','不保证，可能存在延迟','只取决于SELECT拼写','永远看不到'],1,'传输和应用都需要时间，可能存在复制延迟。'],
 ['已接收{1,2,3,4}，已执行{1,2}，待执行是？',['{1,2}','{3,4}','空集','{1,4}'],1,'从接收集合中减去已执行事务。'],
 '用集合计算待应用事务：received={1,2,3,4}，executed={1,2}，升序输出3 4。',mysql+'replication.html');
add('sql-pool','sql','连接池、超时与事务清理','复用 · 有界资源 · 会话状态','运维与架构',
 [['复用昂贵的连接','数据库连接包含认证与会话资源，连接池复用这些资源并限制并发连接数。池不是无限队列，过大的池可能放大数据库竞争而不是提高吞吐。'],['借出与归还都有契约','借出应有等待超时，归还要结束未完成事务并清理隔离级别、临时设置等状态。连接失效要检测替换，不能让下一个请求继承前一个请求的未提交数据。'],['用令牌模型练习容量','容量2的教学池借出两个令牌后，第三次请求失败；归还一个后可再次借出。这个模型不建立网络连接，只说明容量、不重复归还和资源生命周期。']],
 '真实连接池需要线程安全、健康检查、最大生命周期和驱动支持；本示例只展示单线程容量控制。','本例用有序集合 O(log capacity)，实际借还延迟还包括同步与检测。',
 cpp(String.raw`set<int> free={0,1};auto acquire=[&](){if(free.empty())return -1;int id=*free.begin();free.erase(id);return id;};
int a=acquire(),b=acquire(),c=acquire();cout<<a<<' '<<b<<' '<<c<<' ';free.insert(a);cout<<acquire();`),
 String.raw`free={0,1}
def acquire():
    if not free:
        return -1
    token=min(free)
    free.remove(token)
    return token
a,b,c=acquire(),acquire(),acquire()
free.add(a)
print(a,b,c,acquire())`,'0 1 -1 0',
 ['连接归还前通常需要检查什么？',['未结束事务与会话状态','网页颜色','编译器版本','所有主键都相同'],0,'防止下一个请求继承错误事务和配置状态。'],
 ['容量2、两连接均借出，第三次请求不能直接？',['等待或超时','无界创建新连接而仍称有界池','返回受控失败','记录等待时间'],1,'无限扩容破坏池的资源上限和保护目的。'],
 '实现单线程容量2令牌池，依次借3次、归还第一个再借一次，输出0 1 -1 0。', 'https://dev.mysql.com/doc/connector-python/en/connector-python-connection-pooling.html');
add('sql-migration','sql','数据库迁移与兼容部署','版本记录 · 扩展/收缩 · 幂等','运维与架构',
 [['结构变化也是发布','新增列、修改类型和建索引可能需要元数据锁或数据重写。应识别读写兼容窗口、应用部署顺序、回滚能力和执行时间，而不是把DDL当作无成本配置。'],['先扩展再收缩','兼容迁移常先添加新结构，使新旧应用都能工作，再回填和切换读取，最后删除旧结构。双写和回填必须处理并发写入，确保数据没有在迁移途中丢失。'],['记录已完成迁移','迁移工具保存版本号与校验信息，防止重复执行。教学模型按已执行集合跳过版本1、2，只运行3、4，并输出新执行的版本；它不连接数据库或保证真实DDL可回滚。']],
 '“重复执行不报错”不等于迁移正确；失败重试还需识别已经部分生效的步骤。','迁移检查集合平均/对数成本较低，真正成本通常在DDL、回填与锁。',
 cpp(String.raw`set<int> applied={1,2};for(int version:{1,2,3,4})if(applied.insert(version).second)cout<<version<<' ';`),
 String.raw`applied={1,2}
executed=[]
for version in [1,2,3,4]:
    if version not in applied:
        applied.add(version)
        executed.append(version)
print(*executed)`,'3 4',
 ['扩展/收缩迁移通常先做什么？',['先删旧列','增加兼容的新结构','停掉所有备份','删除版本表'],1,'先扩展可支持兼容部署，最后再收缩旧结构。'],
 ['已执行{1,2}，计划1、2、3、4，新增执行版本应是？',['1 2','2 3','3 4','全部再来'],2,'跳过已执行版本，顺序运行尚未执行的版本。'],
 '实现迁移版本过滤：applied={1,2}，计划[1,2,3,4]，只输出并记录3、4；重复运行不应再次输出。',mysql+'innodb-online-ddl.html');

// 以下程序是单项机制的教学实现，不是完整语言的编译器。
function comp(x){add(x.id,'compiler',x.title,x.sub,x.group,x.sections,x.pit,x.cost,cpp(x.c),x.p,x.out,x.q1,x.q2,x.task,x.source||cornell);}
comp({id:'compiler-pipeline',title:'编译流水线与中间表示',sub:'前端 · 中端 · 后端',group:'词法与形式语言',
sections:[['每阶段回答不同问题','词法分析识别单词，语法分析组织结构，语义分析检查名称与类型。中端把程序变换为更适合优化的表示，后端再选择目标指令、分配寄存器并生成机器码。链接器处理跨文件符号。'],['表示之间需要清晰接口','Token 保留类别与源位置，AST 保留语言结构，IR 让控制流和数据依赖更显式。一个阶段成功并不代表下一阶段也合法：未知变量可以通过语法分析而在语义阶段失败。'],['实践：构建一条三地址指令','例子把单个 a+b 表达式变成 t0 = a + b。这里输入已拆为操作数和运算符，仅演示降低表示层次，不执行词法分析、类型检查或真实机器码生成。']],pit:'不要将“运行了一个解释器”与“生成并执行机器码”混称为编译全流程。',cost:'本例单条指令 O(1)；一般转换至少要遍历输入表示。',c:String.raw`string left="a",op="+",right="b"; cout<<"t0 = "<<left<<" "<<op<<" "<<right;`,p:`left, op, right = 'a', '+', 'b'
print(f't0 = {left} {op} {right}')`,out:'t0 = a + b',q1:['检查未声明变量通常属于？',['词法分析','语义分析','文件压缩','链接下载'],1,'名称解析属于静态语义检查。'],q2:['哪项最接近中间表示的作用？',['绑定唯一CPU','连接前端与优化/后端','替代所有源代码','只记录文件名'],1,'IR 解耦语言前端与目标后端，并承载分析。'],task:'将已分解的左操作数 a、运算符 +、右操作数 b 转成三地址指令 t0 = a + b。'});
comp({id:'compiler-regex',title:'正则语言与词法规则',sub:'连接 · 选择 · 闭包 · 最长匹配',group:'词法与形式语言',sections:[['用规则描述 token','正则表达式以连接、选择和重复组合字符集合。例如 [A-Za-z_][A-Za-z0-9_]* 描述简化的 ASCII 标识符，第一位和后续位置的限制不同。'],['词法器还需要冲突规则','完整词法器通常在当前位置选择最长可匹配前缀；长度相同再按规则优先级决定。关键字 if 可以先按标识符识别再查关键字表，不能仅靠随意排列规则解决全部冲突。'],['实践：整串标识符验证','对三个字符串做整串匹配，区分合法标识符与以数字开头的串。它是 token 验证器，不是扫描完整程序的最长匹配词法器。']],pit:'正则匹配局部子串和匹配整串不同；嵌套括号语言一般需要栈或语法分析。',cost:'此简单模式可线性扫描；通用回溯型正则引擎不保证所有模式线性。',c:String.raw`regex r("[A-Za-z_][A-Za-z0-9_]*");for(string s:{"alpha_2","2alpha","_x"})cout<<s<<" "<<regex_match(s,r)<<'\n';`,p:String.raw`import re
for s in ['alpha_2','2alpha','_x']:
    print(s, int(re.fullmatch(r'[A-Za-z_][A-Za-z0-9_]*', s) is not None))`,out:'alpha_2 1\n2alpha 0\n_x 1',q1:['星号闭包允许重复几次？',['恰好一次','至少一次','零次或多次','最多两次'],2,'Kleene 星包含空串。'],q2:['规则 if 与标识符同时匹配 if，通常如何决策？',['随机','长度相同按优先级或关键字表','总选后面的字母','删除 token'],1,'最长匹配后仍需确定平局规则。'],task:'完整匹配 ASCII 标识符：alpha_2、2alpha、_x，按顺序输出有效性 1、0、1。'});
comp({id:'compiler-nfa',title:'NFA、ε 闭包与子集构造',sub:'状态集合 · ε 转移 · DFA',group:'词法与形式语言',sections:[['非确定不等于随机','NFA 同时保留所有可能状态，一条输入能接受，只需至少一条路径最终到达接受态。ε 转移不消耗字符，因此读取字符前后都需考虑闭包。'],['把集合变成 DFA 状态','子集构造以 NFA 状态集合为 DFA 状态，初态是起点的 ε 闭包。对字符求所有可达状态再求闭包；任一成员为接受态时整个集合为接受态。最坏可产生指数个集合。'],['实践：模拟 a*b','使用 0→ε1、1→a1、1→b2 的 NFA。闭包由工作队列求解，输入 aaab 后集合包含接受态 2。这实现 NFA 模拟，不生成完整 DFA 表。']],pit:'遗漏字符转移后的 ε 闭包会漏掉可接受路径；空串也要检查初始闭包。',cost:'本例状态常数，处理长度 n 为 O(n)；一般集合模拟与状态数和边数有关。',c:String.raw`map<int,vector<int>> eps{{0,{1}}};map<pair<int,char>,vector<int>> tr{{{1,'a'},{1}},{{1,'b'},{2}}};
auto closure=[&](set<int> s){queue<int> q;for(int x:s)q.push(x);while(!q.empty()){int u=q.front();q.pop();for(int v:eps[u])if(s.insert(v).second)q.push(v);}return s;};
set<int>s=closure({0});for(char ch:string("aaab")){set<int>next;for(int u:s)for(int v:tr[{u,ch}])next.insert(v);s=closure(next);}cout<<(s.count(2)?"accept":"reject");`,p:`eps={0:[1]}
tr={(1,'a'):[1],(1,'b'):[2]}
def closure(states):
    states=set(states); work=list(states)
    while work:
        u=work.pop()
        for v in eps.get(u,[]):
            if v not in states:
                states.add(v); work.append(v)
    return states
states=closure({0})
for ch in 'aaab':
    states=closure({v for u in states for v in tr.get((u,ch),[])})
print('accept' if 2 in states else 'reject')`,out:'accept',q1:['ε 转移消耗几个输入字符？',['0','1','2','任意但至少1'],0,'ε 转移无需读取字符。'],q2:['DFA 的一个子集状态何时接受？',['所有成员接受','至少一个成员接受','成员数为偶数','集合为空'],1,'NFA 只需存在一条接受路径。'],task:'实现给定 a*b 的 NFA 集合模拟，aaab 输出 accept；再用空串、aaa、b、ba 检查边界。'});
comp({id:'compiler-dfa-min',title:'DFA 最小化与等价状态',sub:'初始划分 · 划分细化',group:'词法与形式语言',sections:[['状态等价取决于未来输入','若从两个状态出发，对任意后缀都给出相同接受结论，则它们等价。接受态与非接受态先分开，再按每个字符转移到哪个分组继续细分。'],['细化直到稳定','同组中若某字符的后继落在不同组，就不能保持等价。重复细化直到分组不变，合并等价状态得到更小的 DFA；完整流程还要先移除不可达状态。'],['实践：合并重复的接受状态','三状态机器的状态 1、2 都接受且未来行为相同，初始状态 0 不接受。程序对二字符字母表细化，得到两个等价类。这里输入所有状态可达且转移完整。']],pit:'只比较某一步转移的具体状态编号会错过等价状态；应比较后继所在的等价类。',cost:'朴素重复细化最坏约 O(k n² log n)，高效 Hopcroft 算法可更快。',c:String.raw`vector<vector<int>> t{{1,2},{1,2},{1,2}};vector<int>g{0,1,1};while(true){map<vector<int>,int>ids;vector<int>n;for(int i=0;i<3;i++){vector<int>key{g[i],g[t[i][0]],g[t[i][1]]};if(!ids.count(key))ids[key]=int(ids.size());n.push_back(ids[key]);}if(n==g)break;g=n;}cout<<set<int>(g.begin(),g.end()).size();`,p:`trans=[[1,2],[1,2],[1,2]]
groups=[0,1,1]
while True:
    ids={}; new=[]
    for i,row in enumerate(trans):
        key=(groups[i],*(groups[v] for v in row))
        if key not in ids: ids[key]=len(ids)
        new.append(ids[key])
    if new==groups: break
    groups=new
print(len(set(groups)))`,out:'2',q1:['接受态与非接受态能等价吗？',['能','不能','仅偶数状态能','只看编号'],1,'空后缀即可区分它们。'],q2:['两个状态对字符 a 转到不同等价类，意味着？',['仍必然等价','必须被区分','删除字符a','全部状态合并'],1,'该字符和区分后继的后缀组成区分串。'],task:'对转移表 [[1,2],[1,2],[1,2]]、接受态 {1,2} 实现划分细化，输出最小等价类数 2。'});
comp({id:'compiler-cfg-ambiguity',title:'上下文无关文法与二义性',sub:'推导 · 语法树 · 优先级',group:'语法分析',sections:[['文法定义结构','CFG 由非终结符、终结符、产生式和开始符号组成。推导替换非终结符直到得到终结符串。语法树关注结构，不同的推导顺序可能仍对应同一棵树。'],['二义性是树不唯一','E→E+E | id 对 id+id+id 有两种括号结构。优先级和结合性可以通过分层文法或分析器规则指定；一般 CFG 是否二义不存在通用判定算法。'],['实践：计算加法链的结构数','含 n 个操作数的完全二叉括号结构数满足 Catalan 递推。程序算三个操作数的结构数 2，以有限输入展示二义性，而不充当任意文法的二义性判定器。']],pit:'算术结果相同不代表语法树相同；减法、浮点运算和副作用使结合次序更加重要。',cost:'动态规划 O(n²) 时间、O(n) 空间；固定宽整数只适合较小 n。',c:String.raw`int n=3;vector<long long>d(n+1);d[1]=1;for(int k=2;k<=n;k++)for(int left=1;left<k;left++)d[k]+=d[left]*d[k-left];cout<<d[n];`,p:`n=3
ways=[0]*(n+1); ways[1]=1
for k in range(2,n+1):
    for left in range(1,k): ways[k]+=ways[left]*ways[k-left]
print(ways[n])`,out:'2',q1:['文法二义意味着某个串有？',['多个字符','两棵不同语法树','两个空格','多个终结符'],1,'关键是同一串拥有不同结构的语法树。'],q2:['三个操作数连加有几种完全括号结构？',['1','2','3','6'],1,'(a+b)+c 与 a+(b+c)。'],task:'用 Catalan 递推计算 3 个操作数的括号结构数 2，并验证 4 个操作数为 5。'});
comp({id:'compiler-grammar-rewrite',title:'消除左递归与提取左因子',sub:'等价语言 · 预测分析',group:'语法分析',sections:[['直接左递归的风险','A→Aα | β 的朴素递归下降会在消耗输入前再次调用 A，导致无限递归。可改为 A→βA′、A′→αA′ | ε，保持生成的串集合。'],['左因子延迟选择','A→αβ | αγ 可提取为 A→αA′、A′→β | γ，让分析器先匹配公共前缀。消除左递归和提取左因子并不保证任意文法都会变成 LL(1)。'],['实践：把加法链解析成左结合值','E→E+n | n 改写为 E→nE′。程序使用循环读取加号后整数，同时累积左结合的语义值，避免把改写后右递归语法树误当成原运算结合性。']],pit:'变换保持语言不自动保持语义动作的执行顺序；减法链必须显式维护左结合。',cost:'输入 n 个字符时 O(n) 扫描，常数额外空间。',c:String.raw`istringstream in("8+3+2");long long value,x;char op;if(!(in>>value))throw runtime_error("number");while(in>>op){if(op!='+'||!(in>>x))throw runtime_error("syntax");value+=x;}cout<<value;`,p:`parts='8+3+2'.split('+')
if not all(x.isdigit() for x in parts): raise ValueError('syntax')
value=int(parts[0])
for x in parts[1:]: value+=int(x)
print(value)`,out:'13',q1:['直接左递归可能使递归下降？',['自动并行','未消耗输入即无限递归','总能结束','省掉栈'],1,'先递归自身导致没有推进。'],q2:['提取左因子一定得到 LL(1) 吗？',['一定','不一定','只有两条规则时一定','所有CFG都LL1'],1,'FIRST/FOLLOW 冲突仍可能存在。'],task:'用消除左递归后的循环形式处理 8+3+2，输出 13；拒绝缺少数字的 8+。'});
comp({id:'compiler-first-follow',title:'FIRST、FOLLOW 与可空性',sub:'不动点 · 预测集合',group:'语法分析',sections:[['FIRST 看能从哪里开始','FIRST(X) 收集 X 可推导串的首终结符，若可推导空串则记 ε。对序列从左往右累加 FIRST，只有前项可空才继续看后一项。'],['FOLLOW 看后面可能出现什么','FOLLOW(A) 收集句型中 A 后面可能紧接的终结符，开始符号还包含结束标记 $。A→αBβ 要把 FIRST(β) 去掉 ε 加入 FOLLOW(B)，β 可空时还加入 FOLLOW(A)。'],['实践：有限文法的 FIRST 不动点','S→AB、A→aA|ε、B→b。反复遍历规则直到集合不再增长，得到 FIRST(S)={a,b}。程序实现一般序列的 FIRST 传播；FOLLOW 的规则在概念中给出，需在预测表课程中使用。']],pit:'ε 是空串标记，不能作为真正输入 token 放入分析表的终结符列。',cost:'有限集合单调增长保证终止；朴素算法重复扫描所有产生式。',c:String.raw`map<char,vector<string>>rules{{'S',{"AB"}},{'A',{"aA",""}},{'B',{"b"}}};map<char,set<char>>f;bool change=true;while(change){change=false;for(auto [a,rs]:rules)for(string rhs:rs){bool nullable=true;for(char x:rhs){set<char>v=rules.count(x)?f[x]:set<char>{x};for(char c:v)if(c!='#')change|=f[a].insert(c).second;if(!v.count('#')){nullable=false;break;}}if(nullable)change|=f[a].insert('#').second;}}for(char c:f['S'])cout<<c;`,p:`rules={'S':['AB'],'A':['aA',''],'B':['b']}
first={k:set() for k in rules}
while True:
    before={k:set(v) for k,v in first.items()}
    for lhs,choices in rules.items():
        for rhs in choices:
            nullable=True
            for x in rhs:
                values=first[x] if x in rules else {x}
                first[lhs].update(values-{'#'})
                if '#' not in values:
                    nullable=False; break
            if nullable: first[lhs].add('#')
    if first==before: break
print(''.join(sorted(first['S'])))`,out:'ab',q1:['开始符号的 FOLLOW 应包含？',['ε','$','所有非终结符','空格'],1,'$ 表示输入结束。'],q2:['A 可空且 FIRST(A)={a,ε}，FIRST(B)={b}，FIRST(AB) 是？',['{a}','{b}','{a,b}','{ε}'],2,'A 可空，B 的首终结符也可作为整个序列的首字符。'],task:'实现 FIRST 集合不动点计算，对 S→AB、A→aA|ε、B→b 输出 S 的 FIRST 为 ab。'});
comp({id:'compiler-ll1',title:'LL(1) 预测分析表与分析栈',sub:'单符号向前看 · 表驱动',group:'语法分析',sections:[['表项来自预测集合','对 A→α，把规则填入 FIRST(α) 的非空终结符列；α 可空时填入 FOLLOW(A) 列。如果同一格需要多条不同规则，文法不能直接用该 LL(1) 表确定选择。'],['分析栈替代递归调用','栈顶为终结符时与当前输入匹配；为非终结符时查表，用产生式右部逆序入栈。栈和输入同时到结束标记才接受。'],['实践：识别 a*b','文法 S→AB、A→aA|ε、B→b。表中 A 在 a 上展开 aA，在 b 上展开为空。程序对 aaab 逐步分析并接受，同时对缺失末尾 b 的输入能够拒绝。']],pit:'逆序压栈才能先处理产生式左端符号；错误表项应报错，不能悄悄当 ε。',cost:'对固定文法、无循环的正确分析表，处理输入通常 O(n)，栈最多 O(n)。',c:String.raw`map<pair<char,char>,string>t{{{'S','a'},"AB"},{{'S','b'},"AB"},{{'A','a'},"aA"},{{'A','b'},""},{{'B','b'},"b"}};string input="aaab$";vector<char>s{'$','S'};size_t i=0;bool ok=true;while(!s.empty()&&ok){char x=s.back();s.pop_back();if(x=='a'||x=='b'||x=='$'){if(i>=input.size()||input[i++]!=x)ok=false;}else{auto it=t.find({x,input[i]});if(it==t.end())ok=false;else for(auto p=it->second.rbegin();p!=it->second.rend();++p)s.push_back(*p);}}cout<<(ok&&i==input.size()?"accept":"reject");`,p:`table={('S','a'):'AB',('S','b'):'AB',('A','a'):'aA',('A','b'):'',('B','b'):'b'}
text='aaab$'; stack=['$','S']; i=0; ok=True
while stack and ok:
    x=stack.pop()
    if x in 'ab$':
        ok=i<len(text) and text[i]==x
        i+=1
    elif (x,text[i]) not in table: ok=False
    else: stack.extend(reversed(table[x,text[i]]))
print('accept' if ok and i==len(text) else 'reject')`,out:'accept',q1:['LL(1) 的 1 表示？',['只有一条规则','一个向前看符号','一个状态','只读一行'],1,'分析决策只查看当前的一个输入符号。'],q2:['同一表格单元含两条产生式说明？',['表一定正确','存在预测冲突','全部接受','必须删除输入'],1,'不能确定唯一展开规则。'],task:'实现给定文法的表驱动 LL(1) 分析器，aaab 接受，aaa 和 ba 拒绝。'});
comp({id:'compiler-lr',title:'LR 项目、闭包与移进归约',sub:'项目集 · 活前缀 · GOTO',group:'语法分析',sections:[['点标记当前识别进度','项目 A→α·β 表示已识别 α，还期待 β。点后为非终结符 B 时，闭包加入 B 的所有点在开头的产生式，直到不再新增。GOTO 将点跨过某符号后再求闭包。'],['移进与归约反向构造推导','移进消耗输入并压入新状态；归约用右部长度弹栈，再按左部非终结符查 GOTO。LR 分析自底向上重建最右推导的逆序，不等于任意看到右部就立即替换。'],['实践：构造初始 LR(0) 项目闭包','对 Z→S、S→aS|b，从 Z→·S 出发，加入 S 的两条初始项目，得到三个项目。程序实现工作队列闭包；完整状态图和 ACTION 表不在本例中生成。']],pit:'归约需要状态和向前看条件，仅匹配栈上字符会产生错误决策。',cost:'单次闭包在项目数量有限时终止，集合去重成本取决于实现。',c:String.raw`vector<pair<char,string>>p{{'Z',"S"},{'S',"aS"},{'S',"b"}};set<pair<int,int>>items{{0,0}};queue<pair<int,int>>q;q.push({0,0});while(!q.empty()){auto [r,d]=q.front();q.pop();if(d==int(p[r].second.size()))continue;char x=p[r].second[d];for(int j=0;j<int(p.size());j++)if(p[j].first==x&&items.insert({j,0}).second)q.push({j,0});}cout<<items.size();`,p:`rules=[('Z','S'),('S','aS'),('S','b')]
items={(0,0)}; work=[(0,0)]
while work:
    r,d=work.pop(); rhs=rules[r][1]
    if d==len(rhs): continue
    for j,(lhs,_) in enumerate(rules):
        if lhs==rhs[d] and (j,0) not in items:
            items.add((j,0)); work.append((j,0))
print(len(items))`,out:'3',q1:['项目点的位置表示？',['输入行号','产生式右部识别进度','类型大小','寄存器号'],1,'点前已识别，点后待识别。'],q2:['A→α·Bβ 的闭包应补充？',['B→·γ 的所有产生式','所有完整项目','删除B','把β全移进'],0,'为了识别 B，需要考虑 B 的所有候选开头。'],task:'构造 Z→·S 的 LR(0) 闭包，文法 Z→S、S→aS|b，输出项目数 3。'});
comp({id:'compiler-lr-families',title:'SLR、LR(1) 与 LALR 的冲突',sub:'FOLLOW · 向前看集合 · 状态合并',group:'语法分析',sections:[['归约条件精度逐步不同','SLR 在已完成项目 A→α· 上使用 FOLLOW(A) 作为归约条件；规范 LR(1) 把向前看符号放入项目，区分更细的上下文，因此可接受更多文法。'],['LALR 合并相同 LR(0) 核心','LALR 把具有相同核心的 LR(1) 状态合并，并合并项目的向前看集合，减少状态数。合并可能引入归约/归约冲突；处理冲突应检查文法或明确优先级，不能随意覆盖表项。'],['实践：检测 ACTION 冲突','把动作列表写入以状态与终结符为键的表。当同一格出现 shift 4 与 reduce 2 时报告冲突。该检测适用于各种表构造结果，不生成 LR 状态图，也不自动解决冲突。']],pit:'某个解析器生成器默认“优先移进”不是文法天然无二义的证明。',cost:'m 个候选动作使用有序表 O(m log m)，空间 O(m)。',c:String.raw`map<pair<int,char>,string>table;vector<pair<pair<int,char>,string>>a{{{3,'+'},"shift 4"},{{3,'+'},"reduce 2"}};int conflicts=0;for(auto [key,act]:a){if(table.count(key)&&table[key]!=act)conflicts++;else table[key]=act;}cout<<conflicts;`,p:`table={}; conflicts=0
for key,action in [((3,'+'),'shift 4'),((3,'+'),'reduce 2')]:
    if key in table and table[key]!=action: conflicts+=1
    else: table[key]=action
print(conflicts)`,out:'1',q1:['SLR 用哪个集合决定归约列？',['FIRST(起点)','FOLLOW(归约左部)','所有字符','全部非终结符'],1,'已完成项目按左部 FOLLOW 集合放置归约。'],q2:['LALR 合并同核心状态可能引入？',['归约/归约冲突','字符编码错误必然发生','链接重复符号','无限寄存器'],0,'向前看集合合并可能让两条归约落到同一表格单元。'],task:'为 ACTION 表添加同一 (3,+) 的 shift 4 和 reduce 2，检测并输出一个冲突，不静默覆盖。'});
comp({id:'compiler-attributes',title:'属性文法与语法制导翻译',sub:'综合属性 · 继承属性 · 依赖顺序',group:'语义分析',sections:[['语法结构承载语义值','综合属性由子节点计算父节点，例如表达式节点的值来自左右孩子。继承属性从父节点或兄弟传入，例如当前作用域、期望类型或偏移量。'],['依赖决定求值次序','属性之间构成依赖图，必须先算依赖再算使用者。纯综合属性常可后序遍历计算；带继承属性时需要设计访问顺序，循环依赖不能靠随意递归解决。'],['实践：后序表达式的综合值','栈模拟后序 AST 遍历：遇到数字入栈，遇到二元操作弹出右、左操作数并计算。给定 2 3 + 4 * 产生综合值 20。只演示纯整数、无副作用属性。']],pit:'弹栈顺序在减法和除法中很重要，先弹的是右操作数。',cost:'n 个 token 为 O(n) 时间，O(n) 栈空间。',c:String.raw`vector<string>tokens{"2","3","+","4","*"};vector<int>s;for(string t:tokens){if(t=="+"||t=="*"){if(s.size()<2)throw runtime_error("operand");int b=s.back();s.pop_back();int a=s.back();s.pop_back();s.push_back(t=="+"?a+b:a*b);}else s.push_back(stoi(t));}if(s.size()!=1)throw runtime_error("expression");cout<<s.back();`,p:`stack=[]
for t in ['2','3','+','4','*']:
    if t in ('+','*'):
        if len(stack)<2: raise ValueError('operand')
        b=stack.pop(); a=stack.pop()
        stack.append(a+b if t=='+' else a*b)
    else: stack.append(int(t))
if len(stack)!=1: raise ValueError('expression')
print(stack[0])`,out:'20',q1:['由孩子传给父节点的属性叫？',['综合属性','继承属性','全局锁','重定位'],0,'综合属性沿语法树向上计算。'],q2:['后缀式 2 3 + 4 * 的值是？',['14','20','24','9'],1,'先算 2+3，再乘 4。'],task:'用属性求值栈计算 2 3 + 4 *，检查操作数不足与结束后栈元素不唯一的错误。'});
comp({id:'compiler-symbols',title:'符号表、作用域与名字遮蔽',sub:'作用域栈 · 查找 · 绑定',group:'语义分析',sections:[['名字需要绑定到声明','同名字符串不一定指向同一变量。每个声明具有类型、位置、可见范围等信息；名称解析为每次使用找到对应声明，并为后续类型检查与代码生成提供稳定标识。'],['从内向外查找','进入词法作用域压入新表，离开时弹出；声明写入当前表，使用从最内层向外查找。外层同名声明可以被遮蔽，而同一作用域重复声明是否允许由语言规则决定。'],['实践：嵌套变量 x','外层 x=1，内层 x=2。进入内层查得 2，离开后查得 1。例子用值表示绑定内容，真实编译器一般存符号元数据而不是执行时值。']],pit:'编译期词法作用域和运行期调用栈相关但不同；闭包捕获还要处理变量的生存期。',cost:'嵌套深度 d 时，朴素查找需检查至多 d 个表。',c:String.raw`vector<map<string,int>>s{{{"x",1}}};auto lookup=[&](string key){for(auto it=s.rbegin();it!=s.rend();++it)if(it->count(key))return it->at(key);throw runtime_error("undeclared");};s.push_back({{"x",2}});cout<<lookup("x")<<' ';s.pop_back();cout<<lookup("x");`,p:`scopes=[{'x':1}]
def lookup(name):
    for scope in reversed(scopes):
        if name in scope: return scope[name]
    raise NameError(name)
scopes.append({'x':2}); print(lookup('x'),end=' ')
scopes.pop(); print(lookup('x'))`,out:'2 1',q1:['词法作用域中查找名字通常从哪里开始？',['最外层','最近内层','随机层','只在函数外'],1,'最近的可见声明遮蔽外层同名声明。'],q2:['离开内层 x=2 的作用域后，外层 x=1 被永久修改吗？',['一定修改','没有，它是不同绑定','被删除','变成2'],1,'同名的内外声明是不同符号。'],task:'实现作用域栈和从内向外查找，演示内层 x 为2、退出后为1，未声明名字抛错。'});
comp({id:'compiler-types',title:'静态类型检查与类型推导',sub:'规则 · 约束 · 转换',group:'语义分析',sections:[['类型规则排除无意义组合','加法、调用、赋值都有操作数要求。类型环境把变量映射到类型，表达式规则由子表达式类型推出父表达式类型；检查失败要报告源位置和预期类型。'],['推导不是执行程序','类型推导通过约束求类型，而不是先运行表达式观察结果。隐式转换、重载选择、泛型实例化等会扩大复杂度；最一般统一与具有子类型的约束求解也不是同一种算法。'],['实践：小型数值提升规则','本例允许 int+int 得到 int，int/float 的混合加法得到 float，bool 不参与数值加法。两次查询输出 float 和 error，规则刻意简化，不代表 C++ 或 Python 的全部类型系统。']],pit:'不能把某语言“bool 也是整数”的规则无条件迁移到另一种自定义语言。',cost:'单个二元规则 O(1)；遍历无共享 AST 通常至少 O(n)。',c:String.raw`auto plusType=[](string a,string b){if((a!="int"&&a!="float")||(b!="int"&&b!="float"))return string("error");return string(a=="float"||b=="float"?"float":"int");};cout<<plusType("int","float")<<' '<<plusType("bool","int");`,p:`def plus_type(a,b):
    if a not in ('int','float') or b not in ('int','float'): return 'error'
    return 'float' if 'float' in (a,b) else 'int'
print(plus_type('int','float'),plus_type('bool','int'))`,out:'float error',q1:['静态类型检查通常发生在？',['运行所有路径后','编译分析期间','仅网络发送时','磁盘损坏后'],1,'它根据程序结构和类型规则进行静态分析。'],q2:['本例规则下 int+float 的结果？',['int','float','bool','error'],1,'规则规定混合数值提升为 float。'],task:'实现给定小语言的二元加法类型规则，int/float 输出 float，bool/int 输出 error。'});
comp({id:'compiler-tac',title:'三地址代码、临时变量与 IR 降低',sub:'表达式树 · 指令序列 · 求值顺序',group:'中间表示',sections:[['把复杂操作拆成小步骤','三地址代码常用 x=y op z 的形式，让每条指令的定义和使用更清楚。表达式 (a+b)*(c-d) 可以先生成两次局部计算，再生成乘法，临时变量记录中间结果。'],['临时值使数据依赖显式','后一条指令使用前面定义的临时值，构成依赖图。降低时必须保持语言规定的求值次序，尤其要考虑函数调用、异常和内存副作用。'],['实践：由后缀表达式生成 IR','栈上保存变量或临时名，遇到运算符取两个操作数、生成新临时、压回结果。输入 a b + c d - * 得到三条指令；这里没有类型、溢出或副作用。']],pit:'不能为了得到漂亮的临时编号而任意交换具有副作用的子表达式。',cost:'n 个 token，O(n) 指令处理和栈空间。',c:String.raw`vector<string>s;int next=0;for(string t:{"a","b","+","c","d","-","*"}){if(t=="+"||t=="-"||t=="*"){string b=s.back();s.pop_back();string a=s.back();s.pop_back();string r="t"+to_string(next++);cout<<r<<" = "<<a<<" "<<t<<" "<<b<<'\n';s.push_back(r);}else s.push_back(t);}`,p:`stack=[]; next_id=0
for t in ['a','b','+','c','d','-','*']:
    if t in ('+','-','*'):
        b=stack.pop(); a=stack.pop(); r=f't{next_id}'; next_id+=1
        print(f'{r} = {a} {t} {b}'); stack.append(r)
    else: stack.append(t)`,out:'t0 = a + b\nt1 = c - d\nt2 = t0 * t1',q1:['三地址代码中临时变量的主要作用？',['存文件路径','显式保存中间结果','自动加密','消除所有分支'],1,'临时值连接分解后的指令。'],q2:['(a+b)*(c-d) 按本例二元指令生成几条？',['1','2','3','4'],2,'两个内层运算和一个乘法。'],task:'将 a b + c d - * 转为三地址代码，临时名从 t0 递增，保持左、右操作数顺序。'});
comp({id:'compiler-basic-blocks',title:'基本块与控制流图 CFG',sub:'入口 · 跳转 · 后继边',group:'中间表示',sections:[['基本块内部没有分叉','基本块是一段单入口、顺序执行且只在末尾转移控制的指令。第一条指令、跳转目标、跳转后的下一条通常是领导者，由此可以切分指令序列。'],['控制流图连接基本块','节点是基本块，边表示可能的执行转移。条件跳转有真、假后继；无条件跳转没有顺序落下边；return 没有后继。不可达块可通过从入口的图遍历发现。'],['实践：计算可达块','给定菱形控制流 0→1/2→3，加一个孤立块4。从入口 BFS 访问，输出0、1、2、3。例子演示已有 CFG 的可达性，不从真实汇编提取块。']],pit:'CFG 的两条边表示可能执行，并不意味着一次运行会同时走两条。',cost:'V 个块、E 条边，遍历 O(V+E) 时间、O(V) 空间。',c:String.raw`vector<vector<int>>g{{1,2},{3},{3},{},{}};vector<bool>seen(5);queue<int>q;q.push(0);seen[0]=true;while(!q.empty()){int u=q.front();q.pop();cout<<u<<' ';for(int v:g[u])if(!seen[v]){seen[v]=true;q.push(v);}}`,p:`from collections import deque
graph=[[1,2],[3],[3],[],[]]; seen={0}; queue=deque([0])
while queue:
    u=queue.popleft(); print(u,end=' ')
    for v in graph[u]:
        if v not in seen: seen.add(v); queue.append(v)`,out:'0 1 2 3',q1:['return 块一般有几个函数内后继？',['0','1','2','与变量数相同'],0,'返回离开当前函数的正常控制流。'],q2:['菱形 CFG 的两个分支汇入同一块，表示？',['代码重复两次执行','存在控制流汇合点','必定死循环','无入口'],1,'不同路径可能到达同一后继。'],task:'对含孤立块4的菱形 CFG 从0遍历，输出可达块0 1 2 3，并指出4不可达。'});
comp({id:'compiler-dataflow',title:'数据流分析与活跃变量',sub:'IN/OUT · GEN/KILL · 不动点',group:'优化与数据流',sections:[['活跃性描述未来需求','若某变量当前值沿某条后续路径会在重新定义前被使用，则它在当前位置活跃。该信息帮助删除死赋值和分配寄存器，是保守的静态近似。'],['从后往前传播集合','OUT[B] 为所有后继 IN 的并集；IN[B]=USE[B]∪(OUT[B]−DEF[B])。对有限变量集合反复更新直到稳定，循环控制流也能处理。USE 只含块内首次定义之前的使用。'],['实践：两块的集合传播','块0定义x且无使用，块1使用x。算法得 IN[0]为空、OUT[0]={x}。输出两个集合大小0和1，体现定义前不需要旧x，定义后新x仍有用。']],pit:'把 USE 写成“块中出现过的所有读取”会把先定义后使用的局部值错误传播到块入口。',cost:'有限集合单调迭代必终止；成本与边数、变量数和迭代次数有关。',c:String.raw`vector<set<string>>use{{},{"x"}},def{{"x"},{}},in(2),out(2);vector<vector<int>>succ{{1},{}};bool changed=true;while(changed){changed=false;for(int b=1;b>=0;b--){set<string>o;for(int s:succ[b])o.insert(in[s].begin(),in[s].end());set<string>i=use[b];for(auto x:o)if(!def[b].count(x))i.insert(x);if(i!=in[b]||o!=out[b])changed=true;in[b]=i;out[b]=o;}}cout<<in[0].size()<<' '<<out[0].size();`,p:`use=[set(),{'x'}]; defs=[{'x'},set()]; succ=[[1],[]]
ins=[set(),set()]; outs=[set(),set()]
changed=True
while changed:
    changed=False
    for b in (1,0):
        out=set().union(*(ins[s] for s in succ[b]))
        incoming=use[b]|(out-defs[b])
        changed |= incoming!=ins[b] or out!=outs[b]
        ins[b],outs[b]=incoming,out
print(len(ins[0]),len(outs[0]))`,out:'0 1',q1:['活跃变量分析是哪个方向？',['后向','仅前向','随机','不看边'],0,'未来使用向前传播到更早的位置。'],q2:['块定义x，下一块使用x，该块OUT是否含x？',['含','不含','看名字长度','只能含y'],0,'离开定义块后，该新值还会被使用。'],task:'实现两块活跃变量不动点，块0定义x、块1使用x，输出 IN[0] 与 OUT[0] 的大小0 1。'});
comp({id:'compiler-ssa',title:'SSA、支配关系与 φ 节点',sub:'单次赋值 · 分支汇合 · 重命名',group:'中间表示',sections:[['每个名字只定义一次','SSA 给每次赋值一个新版本，使用明确指向某次定义。普通控制流合并时，变量可能来自不同前驱，φ 节点根据实际进入的边选择对应版本。'],['支配关系约束定义可见性','若从入口到块B的所有路径都经过A，则A支配B。SSA 的普通使用应被定义支配；φ 的操作数按前驱边解释。构造算法常用支配树、支配边界与重命名栈。'],['实践：模拟分支汇合的 φ','左分支产生x1=10，右分支产生x2=20。以实际前驱名称选择φ的值，left 输出10。这里只执行选择语义，不实现完整 SSA 构造，也不把φ视作同时计算两个分支。']],pit:'φ 按来源边选择，不能简单把它理解为“任意选一个最近赋值”。',cost:'已知前驱的φ查找在本例 O(log p)，p为前驱数。',c:String.raw`map<string,int>incoming{{"left",10},{"right",20}};string pred="left";cout<<incoming.at(pred);`,p:`incoming={'left':10,'right':20}
predecessor='left'
print(incoming[predecessor])`,out:'10',q1:['SSA 中同一个版本名被定义几次？',['一次','两次','任意次','不能定义'],0,'每个SSA名字只对应一个定义。'],q2:['φ 的选择依据是？',['变量按字母排序','实际进入的前驱边','最大数值','最小寄存器'],1,'每条前驱边对应一个输入值。'],task:'实现 x3=φ(left:x1=10,right:x2=20) 的选择语义，left输出10，right输出20，未知前驱报错。',source:llvm});
comp({id:'compiler-cse',title:'公共子表达式、值编号与死代码',sub:'表达式键 · 可用性 · 副作用',group:'优化与数据流',sections:[['重复表达式需要相同输入值','同样文本 a+b 并不必然产生同样值，a或b可能已被修改。值编号对操作符和输入值编号建立键，发现此前已计算且仍可用的纯表达式时复用结果。'],['删除也需要语义依据','死代码消除删除结果不被需要且无可观察副作用的计算。带I/O、volatile、可能抛出的异常或内存写入不能仅因返回值未使用就删除；加载复用还需别名分析。'],['实践：不可变输入的局部复用','给两次 a+b 和一次 a-b 分配值名。输入不可变，表达式为纯运算，重复的 a+b 复用v0，减法分配v1。这里只演示一个基本块内的表达式表。']],pit:'不能把浮点加法随意按数学交换、结合规则规范化；语言的精度和异常语义可能不同。',cost:'有序映射下n条表达式 O(n log n) 时间和 O(n) 空间。',c:String.raw`map<string,string>values;int n=0;for(string e:{"a+b","a+b","a-b"}){if(!values.count(e))values[e]="v"+to_string(n++);cout<<values[e]<<' ';}`,p:`values={}
for expression in ['a+b','a+b','a-b']:
    if expression not in values: values[expression]=f'v{len(values)}'
    print(values[expression],end=' ')`,out:'v0 v0 v1',q1:['复用表达式至少要求？',['文本一样即可','输入值相同且计算可安全复用','变量名短','代码行相邻'],1,'修改、内存副作用和异常都可能影响合法性。'],q2:['返回值不用的打印调用可以直接删吗？',['可以','不能，打印有可观察副作用','只看字符数','总可换成0'],1,'死结果不等于整个操作无影响。'],task:'为不可变变量上的 a+b、a+b、a-b 做局部值编号，输出v0 v0 v1；解释为何不能直接用于可变内存加载。'});
comp({id:'compiler-loop-opt',title:'循环优化：不变量外提与强度削弱',sub:'支配 · 可投机执行 · 归纳变量',group:'优化与数据流',sections:[['循环不变不等于一定能移动','表达式的输入在循环中不变，是外提的必要线索。还需确保它的定义支配使用、没有别名写入破坏依赖，并且在循环零次执行时提前求值不会引入异常或副作用。'],['归纳变量支持强度削弱','若i每轮加1，4*i也每轮加4，可用递增的派生归纳变量替代重复乘法。现代目标上是否更快还取决于指令、向量化和寄存器压力。'],['实践：保持固定范围的总和','累加i=0..4时的4*i+7，原式与派生变量版本都得到75。用小的非负整数避免溢出，验证两种实现的可观察结果一致。']],pit:'把除法外提可能在原循环零次执行时新增除零异常；仅检查输入不变不够。',cost:'两种版本均 O(n)；削弱只改变常数操作，不改变渐进复杂度。',c:String.raw`int original=0,optimized=0;for(int i=0;i<5;i++)original+=4*i+7;int scaled=0;for(int i=0;i<5;i++,scaled+=4)optimized+=scaled+7;cout<<original<<' '<<optimized;`,p:`original=sum(4*i+7 for i in range(5))
optimized=0; scaled=0
for _ in range(5):
    optimized+=scaled+7; scaled+=4
print(original,optimized)`,out:'75 75',q1:['循环不变量外提还必须考虑？',['只有行数','零次执行与副作用/异常','只看变量名','代码颜色'],1,'移动计算可能让原先不执行的操作发生。'],q2:['i每次加1，4*i每次可改为加几？',['1','2','4','7'],2,'派生归纳变量每轮增加4。'],task:'对i=0..4累加4*i+7，用原始乘法与逐步加4两种方式实现，输出75 75。'});
comp({id:'compiler-registers',title:'寄存器分配、干涉图与溢出',sub:'活跃区间 · 图着色 · Spill',group:'代码生成与运行时',sections:[['有限寄存器承载许多临时值','同时活跃、必须保留的不同值通常不能占同一物理寄存器。干涉图用边记录这种冲突，分配近似为有限颜色的图着色；预着色寄存器、调用约定和指令约束还会限制选择。'],['没有颜色就考虑溢出','寄存器不足时将某些值放到栈槽，需要额外加载和存储。图着色、线性扫描与分裂活跃区间等是常用策略，实际优化目标不只是减少颜色数，还包括运行成本。'],['实践：贪心着色三角干涉图','三个互相干涉的值只有两个寄存器。按节点顺序分配0、1，第三个标记spill。本例是展示冲突约束的简单贪心算法，不声称找到最优溢出方案。']],pit:'在一般图上，贪心算法失败不证明该图无法用给定颜色数着色；结果依赖顺序。',cost:'邻接表贪心约 O(V+E+VK)，K为可用寄存器数。',c:String.raw`vector<vector<int>>g{{1,2},{0,2},{0,1}};vector<int>color(3,-1);for(int u=0;u<3;u++){set<int>used;for(int v:g[u])if(color[v]>=0)used.insert(color[v]);for(int c=0;c<2;c++)if(!used.count(c)){color[u]=c;break;}}for(int c:color)cout<<(c<0?"spill":to_string(c))<<' ';`,p:`graph=[[1,2],[0,2],[0,1]]; colors=[-1]*3
for u in range(3):
    used={colors[v] for v in graph[u] if colors[v]>=0}
    colors[u]=next((c for c in range(2) if c not in used),-1)
print(*('spill' if c<0 else str(c) for c in colors))`,out:'0 1 spill',q1:['干涉边通常表示？',['两个值可随时共用寄存器','两个值同时活跃造成冲突','两文件同名','指令长度相同'],1,'需要同时保存的独立值不能被同一寄存器互相覆盖。'],q2:['三角形干涉图至少需要几种颜色？',['1','2','3','4'],2,'三个节点两两相邻，因此需要三个不同颜色。'],task:'用两个寄存器对三角干涉图做顺序贪心分配，输出0 1 spill，并解释溢出后还需插入哪些指令。'});
comp({id:'compiler-instruction-selection',title:'指令选择与模式覆盖',sub:'目标模式 · 树覆盖 · 成本',group:'代码生成与运行时',sections:[['IR 操作不等于机器指令','目标体系结构有寻址模式、立即数限制和特殊指令。一条IR操作可能展开成多条指令，多个IR节点也可能被一条机器指令覆盖。'],['按合法模式比较成本','可用树或DAG匹配寻找指令模式，再按延迟、大小等估计选择。动态规划可组合子树成本；真实后端还要处理共享子表达式、寄存器约束和调度。'],['实践：虚构目标的两种覆盖','对a*b+c，目标提供MUL与ADD各成本1，以及仅对当前整数语义合法的MAD成本1。程序比较普通覆盖成本2和组合覆盖成本1，选择MAD。它不是生成真实CPU机器码。']],pit:'浮点乘加融合会改变舍入次数，不能把整数示例的融合合法性直接推广到所有浮点模式。',cost:'本例候选数常数；树动态规划成本依赖节点数与每节点模式数。',c:String.raw`map<string,int>cost{{"MUL+ADD",2},{"MAD",1}};auto best=min_element(cost.begin(),cost.end(),[](const auto&a,const auto&b){return a.second<b.second;});cout<<best->first<<' '<<best->second;`,p:`costs={'MUL+ADD':2,'MAD':1}
best=min(costs,key=costs.get)
print(best,costs[best])`,out:'MAD 1',q1:['指令选择主要依赖？',['源文件名','目标指令集与IR模式','用户昵称','SQL索引'],1,'目标的合法模式和约束决定可选指令。'],q2:['浮点 MUL+ADD 替换成 FMA 总是逐位相同吗？',['总是','不总是，舍入次数不同','只看变量名','从不计算'],1,'FMA一次舍入，分开运算通常两次舍入。'],task:'为虚构整数目标比较 MUL+ADD成本2 与MAD成本1，输出MAD 1；写明浮点推广的限制。'});
comp({id:'compiler-calling',title:'调用约定、栈帧与闭包环境',sub:'参数 · 保存寄存器 · 对齐',group:'代码生成与运行时',sections:[['调用者与被调用者共同遵守协议','调用约定规定参数与返回值位置、哪些寄存器由哪方保存、栈对齐及返回地址处理。同样机器码指令若双方采用不同约定，仍可能传错值或破坏寄存器。'],['栈帧是布局与生命周期问题','局部变量、保存值、溢出槽等按对齐要求分配空间。闭包捕获的环境可能比创建它的栈帧活得更久，需要逃逸分析、堆分配或其他生存期管理。'],['实践：简化局部槽布局','在虚构布局中依次放一个大小4对齐4的槽、一个大小8对齐8的槽，偏移为0与8，最后帧大小按16对齐为16。本例不代表某个真实ABI的完整布局。']],pit:'不能默认栈向下增长就直接用正偏移相加当真实地址；帧基址与偏移规则由ABI和后端决定。',cost:'n个槽的顺序布局 O(n) 时间。',c:String.raw`auto align=[](int n,int a){return (n+a-1)/a*a;};int offset=0;for(auto [size,a]:vector<pair<int,int>>{{4,4},{8,8}}){offset=align(offset,a);cout<<offset<<' ';offset+=size;}cout<<align(offset,16);`,p:`def align(n,a): return (n+a-1)//a*a
offset=0; positions=[]
for size,alignment in [(4,4),(8,8)]:
    offset=align(offset,alignment); positions.append(offset); offset+=size
print(*positions,align(offset,16))`,out:'0 8 16',q1:['调用约定需要双方一致的是？',['注释风格','参数位置与寄存器保存规则','源码行数','变量长度'],1,'它是二进制调用接口。'],q2:['偏移4处放对齐8的槽，起始偏移应为？',['4','5','8','16'],2,'向上对齐到下一个8的倍数。'],task:'按(大小4,对齐4)、(大小8,对齐8)顺序安排局部槽，最终帧16字节对齐，输出0 8 16。'});
comp({id:'compiler-gc',title:'运行时内存与垃圾回收',sub:'根集合 · 可达性 · 标记清扫',group:'代码生成与运行时',sections:[['可达对象不能被回收','从栈、全局变量、寄存器等根开始，沿引用访问到的对象仍可能被使用。编译器需要向运行时提供对象布局和安全点等信息，移动式回收器还要更新引用位置。'],['不同回收器有不同代价','标记清扫先标记可达对象再回收未标记者；复制或压缩回收减少碎片但移动对象。引用计数能及时回收部分对象，却需要额外机制处理环；分代回收利用对象寿命分布。'],['实践：标记一个对象图','根为0，引用0→1、1→2，另有不与根连接的自环3→3。遍历标记0、1、2，判定3可回收。程序只计算可达性，不分配真实堆或移动对象。']],pit:'有环不一定是垃圾，是否从根可达才是追踪式GC的标准。',cost:'标记与清扫合计 O(V+E)，标记状态 O(V)。',c:String.raw`vector<vector<int>>g{{1},{2},{},{3}};set<int>marked;vector<int>work{0};while(!work.empty()){int u=work.back();work.pop_back();if(!marked.insert(u).second)continue;for(int v:g[u])work.push_back(v);}for(int i=0;i<4;i++)if(!marked.count(i))cout<<i;`,p:`graph=[[1],[2],[],[3]]; marked=set(); work=[0]
while work:
    u=work.pop()
    if u in marked: continue
    marked.add(u); work.extend(graph[u])
print(*(i for i in range(len(graph)) if i not in marked))`,out:'3',q1:['追踪式GC判断存活主要依据？',['对象编号小','从根集合可达','对象无环','对象名字长'],1,'根可达对象可能仍被程序使用。'],q2:['不与任何根连接的自环对象可以回收吗？',['可以','不能，只要有环就永生','只能改名','必须被读一次'],0,'追踪式GC可以回收不可达的循环引用。'],task:'对0→1→2与3→3，根集合{0}，做标记并输出未标记对象3。'});
comp({id:'compiler-linking',title:'汇编、链接、符号与重定位',sub:'目标文件 · 符号解析 · PC相对地址',group:'代码生成与运行时',sections:[['目标文件保留未确定位置','编译单元可先生成机器指令、数据、符号表和重定位记录。跨文件函数的最终地址可能尚未知，链接器安排段和解析符号后再修补引用。动态链接还可能在装载或首次调用时完成绑定。'],['重定位计算有明确约定','绝对与PC相对重定位使用不同公式。常见形式涉及符号地址S、附加值A和位置P，但P究竟指字段还是下一条指令取决于格式；不能把某个示例公式当所有平台通用。'],['实践：教学PC相对跳转','本例约定编码位移=目标地址−下一条指令地址。目标0x1200、下一条地址0x1005，得到十进制507。仅演算位移，不生成ELF/PE文件，也不处理字段宽度。']],pit:'位移必须能装入目标字段；地址计算正确仍可能因溢出无法编码。',cost:'单次重定位 O(1)；全部重定位通常与记录数量线性相关，另有符号查找成本。',c:String.raw`long long target=0x1200,nextInstruction=0x1005;cout<<target-nextInstruction;`,p:`target=0x1200
next_instruction=0x1005
print(target-next_instruction)`,out:'507',q1:['链接器处理跨文件调用主要需要？',['变量颜色','符号解析和重定位','CSS布局','数据库查询'],1,'确定引用目标并修补地址相关字段。'],q2:['按本例公式0x1200−0x1005的十进制结果？',['507','512','5','4096'],0,'0x1FB 等于507。'],task:'按约定“目标减下一条地址”计算0x1200与0x1005的PC相对位移507，并说明真实格式还需检查字段宽度。'});
comp({id:'compiler-vm-jit',title:'字节码解释器与 JIT',sub:'操作数栈 · 热点 · 即时编译',group:'代码生成与运行时',sections:[['字节码是可执行的中间形式','虚拟机可以用循环取指、译码并执行字节码。栈式虚拟机从操作数栈取输入，寄存器式虚拟机使用显式编号；两者都需处理非法指令、类型与栈深度。'],['JIT 将热点转为机器码','解释器启动成本低，JIT 对频繁执行的路径编译优化并缓存机器码。利用运行时反馈进行推测优化时，需要守卫和去优化路径，以便假设失效后恢复正确执行。'],['实践：一个微型栈机','字节码 PUSH 2、PUSH 3、ADD、PUSH 4、MUL 得到20。程序检查栈元素数并拒绝未知指令，演示解释执行，不声称已经实现JIT或机器码生成。']],pit:'把代码字符串交给eval执行并不等于实现了自己的虚拟机或JIT编译器。',cost:'n条字节码通常 O(n) 分派，操作数栈最多 O(n)。',c:String.raw`vector<pair<string,int>>code{{"PUSH",2},{"PUSH",3},{"ADD",0},{"PUSH",4},{"MUL",0}};vector<int>s;for(auto [op,arg]:code){if(op=="PUSH")s.push_back(arg);else if(op=="ADD"||op=="MUL"){if(s.size()<2)throw runtime_error("underflow");int b=s.back();s.pop_back();int a=s.back();s.pop_back();s.push_back(op=="ADD"?a+b:a*b);}else throw runtime_error("opcode");}if(s.size()!=1)throw runtime_error("stack");cout<<s.back();`,p:`code=[('PUSH',2),('PUSH',3),('ADD',0),('PUSH',4),('MUL',0)]
stack=[]
for op,arg in code:
    if op=='PUSH': stack.append(arg)
    elif op in ('ADD','MUL'):
        if len(stack)<2: raise ValueError('underflow')
        b=stack.pop(); a=stack.pop(); stack.append(a+b if op=='ADD' else a*b)
    else: raise ValueError('opcode')
if len(stack)!=1: raise ValueError('stack')
print(stack[0])`,out:'20',q1:['JIT 的典型编译时机？',['程序运行期间','只在芯片生产前','只能手动写汇编','网络断开后'],0,'JIT 利用运行时信息把代码编译为机器码。'],q2:['推测优化的假设失效时应？',['继续错误运行','通过守卫退回正确路径或去优化','忽略结果','删掉进程所有数据'],1,'优化必须保持语言语义，假设失效需要安全退路。'],task:'实现PUSH/ADD/MUL三种字节码，运行给定序列输出20，并检测空栈ADD与未知操作码。',source:'https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html'});
comp({id:'compiler-correctness',title:'优化正确性、未定义行为与差分测试',sub:'语义保持 · 反例 · 边界输入',group:'优化与数据流',sections:[['正确性是保留可观察行为','变换前后应在适用语义与前提下产生一致的结果、I/O和异常行为。整数溢出、浮点NaN、有符号零、求值顺序等都可能使纸面代数恒等式失效。'],['测试与证明互相补充','差分测试对同一输入比较优化前后程序，可快速找到反例，但有限测试无法证明对所有输入正确。验证器或形式化证明需要明确语言语义和变换前置条件。'],['实践：有限范围验证强度削弱','在−10..10内比较3*x与x+x+x，共21个输入全相同。范围远离C++整数溢出，因此比较有效；本例证明的只有这21次运行，不推断所有类型或所有取值。']],pit:'C++有符号溢出是未定义行为，Python整数可扩展；跨语言示例须明确共同的有效输入范围。',cost:'测试T个输入 O(T) 时间；测试通过不是全称证明。',c:String.raw`int checked=0;for(int x=-10;x<=10;x++){if(3*x!=x+x+x)throw runtime_error("mismatch");checked++;}cout<<checked<<" passed";`,p:`checked=0
for x in range(-10,11):
    assert 3*x==x+x+x
    checked+=1
print(checked,'passed')`,out:'21 passed',q1:['有限差分测试全部通过意味着？',['已证明所有输入正确','只确认测试输入未发现差异','可忽略语义','不需要边界测试'],1,'仍可能存在未覆盖输入和环境下的反例。'],q2:['C++有符号整数溢出与Python大整数语义相同吗？',['相同','不同','仅变量名不同时不同','都自动变0'],1,'C++有符号溢出属于未定义行为，Python整数一般按需扩展。'],task:'对−10..10逐个比较3*x与x+x+x，输出21 passed，并解释为何这不是全输入证明。',source:llvm});
})();

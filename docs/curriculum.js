/* 课程范围说明与来源基线。课程正文为原创，链接指向标准、手册和大学课程。 */
const CURRICULUM = {
 stl:{
  title:'标准库工具体系',
  prerequisite:'熟悉变量、函数、类、引用、模板基础；能够编译简单的 C++ 程序。',
  overview:'从顺序、关联和无序容器，到迭代器、算法与数值工具，建立“数据范围 + 操作 + 复杂度”的标准库使用方法。',
  scope:'覆盖常用 STL 主线及 string、tuple、bitset 等关联工具；新标准特性单独标明版本。每个 API 的全部重载、分配器实现与所有标准库领域不在本课程穷举范围内。',
  sources:[['C++ 标准草案：容器库','https://eel.is/c++draft/containers'],['C++ 标准草案：迭代器库','https://eel.is/c++draft/iterators'],['C++ 标准草案：算法库','https://eel.is/c++draft/algorithms'],['C++ 标准草案：范围库','https://eel.is/c++draft/ranges']],
  tags:['容器体系','迭代器','算法库','C++20/23']
 },
 ds:{
  title:'从存储到查询结构',
  prerequisite:'数组、指针/引用、递归、基础复杂度分析；建议先了解 STL 的常用容器。',
  overview:'沿线性结构、树、哈希、图、区间查询与缓存索引展开，关注不变量、关键操作和时间空间取舍。',
  scope:'覆盖本科核心结构及常见竞赛、工程结构。复杂平衡树和外存结构的示例可能聚焦旋转、查找或性质验证；具体实现范围写在对应课中。',
  sources:[['MIT 6.006：数据结构、排序、哈希、树与堆','https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/calendar/'],['OpenDSA：开放数据结构教材','https://opendsa.org/']],
  tags:['线性结构','平衡树','区间查询','缓存与索引']
 },
 algo:{
  title:'从基本策略到进阶专题',
  prerequisite:'掌握常见数据结构、递归和渐进复杂度；图算法需要邻接表基础。',
  overview:'系统学习排序与搜索、常用优化技巧、贪心与回溯、图论、动态规划、字符串、数论和复杂性边界。',
  scope:'覆盖常见本科与面试/竞赛主线，并引入部分进阶算法。算法领域没有有限的“所有算法”目录；专题以典型问题、适用条件和核心实现为边界。',
  sources:[['MIT 6.006：算法课程日程','https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/calendar/'],['MIT 6.046：算法设计与分析','https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/']],
  tags:['设计策略','图论','动态规划','字符串与数论']
 },
 sql:{
  title:'从关系查询到数据库工程',
  prerequisite:'基本编程能力。SQL 练习需独立测试库；连接器示例需要本地 MySQL 与对应语言依赖。',
  overview:'围绕建模、SQL、索引与优化、InnoDB 事务机制、备份复制和安全管理组织课程，区分数据库实操与机制模型。',
  scope:'以 MySQL 8.4 文档为语义基线。覆盖常用开发与运维主题，企业版专有特性、所有系统变量、每个管理命令及完整集群部署仍需结合官方手册。',
  sources:[['MySQL 8.4：参考手册总目录','https://dev.mysql.com/doc/refman/8.4/en/'],['MySQL 8.4：优化','https://dev.mysql.com/doc/refman/8.4/en/optimization.html'],['MySQL 8.4：InnoDB','https://dev.mysql.com/doc/refman/8.4/en/innodb-storage-engine.html']],
  tags:['SQL 进阶','索引优化','事务机制','备份与复制']
 },
 net:{
  title:'从比特到应用协议',
  prerequisite:'二进制与位运算、基础数据结构；理解进程、端口和客户端/服务端的基本概念。',
  overview:'沿链路、网络、传输、应用逐层学习，同时补充路由、性能、安全与排障，跟踪数据如何到达目的地。',
  scope:'覆盖通用计算机网络主线及现代 Web 相关协议。课程中的协议仿真用于观察某个机制，不是完整协议栈；无线通信和运营商网络仍有更深的专业分支。',
  sources:[['Stanford CS144：计算机网络课程与实验','https://cs144.github.io/'],['RFC 9293：TCP','https://www.rfc-editor.org/rfc/rfc9293.html'],['RFC 9110：HTTP 语义','https://www.rfc-editor.org/rfc/rfc9110.html']],
  tags:['链路与路由','TCP/UDP','应用协议','性能与安全']
 },
 compiler:{
  title:'从源程序到目标代码',
  prerequisite:'递归、树、图与集合；理解有限状态机、基础离散数学和简单机器指令更有帮助。',
  overview:'覆盖词法与语法、语义和类型、中间表示、控制流与数据流、优化、寄存器分配及运行时与链接。',
  scope:'以经典编译器的完整处理流程为主线。示例通常实现一个阶段的核心子问题；尚不是支持完整 C++ 或 Python 语义的生产编译器。',
  sources:[['Cornell CS4120：编译器课程','https://www.cs.cornell.edu/courses/cs4120/2023sp/'],['LLVM：语言前端教程','https://llvm.org/docs/tutorial/MyFirstLanguageFrontend/index.html'],['LLVM：语言参考','https://llvm.org/docs/LangRef.html']],
  tags:['自动机与文法','语义与类型','中间表示','优化与后端']
 }
};
for(const c of CATEGORIES){c.tags=CURRICULUM[c.id].tags;c.desc=CURRICULUM[c.id].overview;c.level='基础 → 进阶 → 专题';}
// 保留早期单元 ID，确保用户已有收藏、草稿和完成状态仍可恢复。
for(const l of LESSONS){l.cppStandard ||= 'C++17';l.sources ||= REFERENCES[l.cat]||CURRICULUM[l.cat].sources;}
// 合并首版与扩充课程的章节名称，并按学习顺序排列；ID 与学习记录不变。
const CHAPTER_ORDER={
 stl:['顺序容器','关联容器','容器适配器','迭代器与有效性','算法库','函数对象与关联工具','现代标准扩展','资源管理与工程边界'],
 ds:['抽象与线性结构','散列与缓存','搜索树与平衡','堆与编码','图与集合','区间与持久化'],
 algo:['算法分析与设计','查找与排序','线性扫描技巧','图算法','动态规划','字符串算法','数论与位运算','计算几何','随机化与复杂性','进阶图与代数算法'],
 sql:['建模与基础','数据查询','SQL 函数与工程细节','索引与执行计划','事务与存储引擎','数据库对象','运维与架构'],
 net:['网络基础','链路层与局域网','网络层与路由','传输层与可靠通信','应用层与网络服务','网络安全与性能'],
 compiler:['词法与形式语言','语法分析','语义分析','中间表示','优化与数据流','代码生成与运行时']
};
const LEGACY_GROUPS={
 'linked-list':'抽象与线性结构',stack:'抽象与线性结构',queue:'抽象与线性结构',tree:'搜索树与平衡',
 transaction:'事务与存储引擎',lexer:'词法与形式语言',parser:'语法分析',expression:'语法分析','constant-fold':'优化与数据流',
 tcp:'传输层与可靠通信',http:'应用层与网络服务',
 'net-delay':'网络基础','net-crc':'链路层与局域网','net-switch-vlan':'链路层与局域网','net-stp':'链路层与局域网',
 'algo-number-theory':'数论与位运算','algo-geometry':'计算几何','algo-randomized':'随机化与复杂性','algo-np-approx':'随机化与复杂性'
};
for(const l of LESSONS)if(LEGACY_GROUPS[l.id])l.group=LEGACY_GROUPS[l.id];
const FIRST_UNITS={'ds-adt':-3,'ds-dynamic-array':-2,'compiler-pipeline':-3};
const chapterRank=l=>{const n=CHAPTER_ORDER[l.cat].indexOf(l.group);return n<0?100:n;};
LESSONS.sort((a,b)=>CATEGORIES.findIndex(c=>c.id===a.cat)-CATEGORIES.findIndex(c=>c.id===b.cat)||chapterRank(a)-chapterRank(b)||(FIRST_UNITS[a.id]||0)-(FIRST_UNITS[b.id]||0));

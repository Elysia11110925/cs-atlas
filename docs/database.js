const SQL_SETUP = `-- 在专用练习数据库中执行一次（不要在业务库中执行）
CREATE DATABASE IF NOT EXISTS cs_atlas;
USE cs_atlas;
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY, name VARCHAR(40), score INT, class_id INT
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY, title VARCHAR(40)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS accounts (
  id INT PRIMARY KEY, balance DECIMAL(12,2) NOT NULL
) ENGINE=InnoDB;
INSERT IGNORE INTO students VALUES (1,'Lin',92,1),(2,'Chen',76,1),(3,'Yu',88,2);
INSERT IGNORE INTO classes VALUES (1,'A'),(2,'B'),(3,'C');
INSERT IGNORE INTO accounts VALUES (1,500.00),(2,100.00);`;
function sqlClients(query, param=null) {
 const c = `// MySQL Connector/C++ 的 JDBC API；链接 mysqlcppconn
// 环境变量 MYSQL_PASSWORD 必须设置；先执行本节初始化 SQL
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/prepared_statement.h>
#include <cppconn/resultset.h>
#include <cstdlib>
#include <memory>
#include <iostream>
int main() {
    const char* password=std::getenv("MYSQL_PASSWORD");
    if(!password) { std::cerr<<"Set MYSQL_PASSWORD"; return 1; }
    try {
        auto driver=sql::mysql::get_mysql_driver_instance();
        std::unique_ptr<sql::Connection> con(driver->connect("tcp://127.0.0.1:3306","root",password));
        con->setSchema("cs_atlas");
        std::unique_ptr<sql::PreparedStatement> stmt(con->prepareStatement(${JSON.stringify(query)}));
        ${param!==null?'stmt->setInt(1, '+param+');':''}
        std::unique_ptr<sql::ResultSet> rows(stmt->executeQuery());
        while(rows->next()) std::cout<<rows->getString(1)<<' '<<rows->getString(2)<<'\\n';
    } catch(const sql::SQLException& e) { std::cerr<<e.what(); return 1; }
}`;
 const p = `# pip install mysql-connector-python
# 设置环境变量 MYSQL_PASSWORD；先执行本节初始化 SQL
import os
import mysql.connector
con = mysql.connector.connect(host="127.0.0.1", user="root",
    password=os.environ["MYSQL_PASSWORD"], database="cs_atlas")
try:
    cursor = con.cursor()
    cursor.execute(${JSON.stringify(query.replaceAll('?','%s'))}${param!==null?', ('+param+',)':''})
    for row in cursor:
        print(*row)
    cursor.close()
finally:
    con.close()`;
 return [c,p];
}
lesson('select','sql','SELECT 与条件查询','过滤 · 排序 · 参数绑定','数据查询',18,
 [['把需求翻译成查询','SELECT 指定输出列，FROM 指定来源，WHERE 过滤记录，ORDER BY 明确顺序。没有 ORDER BY 时，不应假定返回记录按插入或主键顺序排列。'],['用参数承载值','C++ JDBC 接口使用 ? 占位，Python Connector 使用 %s 占位。两者都把值单独绑定，避免把用户输入拼成 SQL。占位符用于值，不能替代任意表名。'],['实践：筛选高分学生','练习表有 Lin 92、Chen 76、Yu 88。筛选 score≥85 并按 score 降序、id 升序排序，得到 Lin 92、Yu 88。第二排序键使同分时也有确定顺序。']],
 'NULL 不等于普通值；判断空值使用 IS NULL。这里的演示表数据无 NULL，客户端需要在生产代码中另外处理可空列。','无合适索引时一般需扫描；排序成本与执行计划相关，用 EXPLAIN 检查。',
 ...sqlClients('SELECT name, score FROM students WHERE score >= ? ORDER BY score DESC, id ASC',85), 'Lin 92\nYu 88',
 ['WHERE 的主要作用是什么？',['按组过滤','过滤行','重命名数据库','提交事务'],1,'WHERE 在分组前对行进行筛选；HAVING 用于分组后的条件。'],
 ['要查询 score 为空的行，应写？',['score = NULL','score == NULL','score IS NULL','score = 0'],2,'NULL 参与普通等号比较不会得到 TRUE，需使用 IS NULL。'],
 '查询成绩至少 85 分的学生姓名和分数，分数降序、同分按 id 升序。用参数绑定传入 85；参考初始化数据输出 Lin 92 和 Yu 88。',
 'SELECT name, score FROM students\nWHERE score >= 85\nORDER BY score DESC, id ASC;');
lesson('join','sql','JOIN 多表关联','连接条件 · LEFT JOIN · 空值','数据查询',22,
 [['关系靠键建立','students.class_id 对应 classes.id。连接条件描述两表如何匹配，而不是把所有行盲目组合；漏写条件可能产生巨大的笛卡尔积。'],['保留谁，决定连接方式','INNER JOIN 只保留匹配行。LEFT JOIN 保留左表所有行，右表未匹配的字段为 NULL。想看包括空班级在内的完整班级名单，应把 classes 放在左边。'],['ON 与 WHERE 不能随意互换','右表条件放入 WHERE，可能过滤掉 LEFT JOIN 产生的 NULL 行，从而改变保留空班级的目标。先想清楚过滤的是匹配关系还是最终结果。']],
 '一对多连接会产生多行，这不是系统重复数据的错误。聚合前要明确每行代表的粒度。','性能取决于表大小、连接条件、索引与优化器选择；先保证条件正确。',
 ...sqlClients("SELECT c.title, COALESCE(s.name, '-') FROM classes c LEFT JOIN students s ON s.class_id=c.id ORDER BY c.id, s.id"), 'A Lin\nA Chen\nB Yu\nC -',
 ['LEFT JOIN 保证保留哪一边未匹配的行？',['右表','左表','两表都不保留','只保留公共行'],1,'左表未匹配时仍输出一行，右侧列填 NULL。'],
 ['A 班有 2 名学生，C 班有 0 名。以班级左连接学生，这两个班共返回几行？',['1','2','3','4'],2,'A 班两行，C 班一条右侧为空的行，共三行。'],
 '列出全部班级及学生，无学生的班级显示 -。按班级 id、学生 id 排序。对初始化表应输出 A Lin、A Chen、B Yu、C -。',
 "SELECT c.title, COALESCE(s.name, '-') AS student\nFROM classes c\nLEFT JOIN students s ON s.class_id=c.id\nORDER BY c.id, s.id;");
lesson('group-by','sql','GROUP BY 与聚合','COUNT · AVG · HAVING','数据查询',22,
 [['从记录到统计','GROUP BY 按相同键把行分组，COUNT、SUM、AVG 对组内数据进行汇总。选择列表中的非聚合列通常应来自分组键，避免含糊的结果。'],['WHERE 与 HAVING 的分工','WHERE 先过滤原始行，HAVING 再过滤聚合后的组。例如“至少两名学生的班级”必须使用 HAVING COUNT(*)≥2。'],['COUNT 的两个口径','COUNT(*) 统计行数，COUNT(column) 忽略该列的 NULL。LEFT JOIN 后对右表主键计数，才能把无匹配的组正确统计为 0。']],
 'AVG 会忽略 NULL；不能直接把多组平均值再取平均来得到总体平均值，除非各组样本量相同。','无合适访问路径时需处理输入行；分组可能利用索引或临时结构。',
 ...sqlClients('SELECT class_id, COUNT(*) FROM students GROUP BY class_id HAVING COUNT(*) >= 2 ORDER BY class_id'), '1 2',
 ['哪个子句用于筛选聚合结果？',['WHERE','HAVING','FROM','LIMIT'],1,'HAVING 可以引用组的聚合结果。'],
 ['某列三行值为 8、NULL、10，COUNT(该列) 等于？',['1','2','3','NULL'],1,'COUNT(column) 只计数非 NULL 值，共两个。'],
 '统计至少有两名学生的 class_id 和学生数量，按 class_id 升序输出。初始化数据中应得到 1 2。',
 'SELECT class_id, COUNT(*) AS student_count\nFROM students\nGROUP BY class_id\nHAVING COUNT(*) >= 2\nORDER BY class_id;');
const TX_CPP = `// MySQL Connector/C++ JDBC API；链接 mysqlcppconn
// 先执行初始化 SQL，设置 MYSQL_PASSWORD
#include <mysql_driver.h>
#include <mysql_connection.h>
#include <cppconn/prepared_statement.h>
#include <cstdlib>
#include <memory>
#include <iostream>
#include <stdexcept>
int main() {
    const char* pw=std::getenv("MYSQL_PASSWORD");
    if(!pw) return 1;
    std::unique_ptr<sql::Connection> con;
    try {
        con.reset(sql::mysql::get_mysql_driver_instance()->connect("tcp://127.0.0.1:3306","root",pw));
        con->setSchema("cs_atlas"); con->setAutoCommit(false);
        std::unique_ptr<sql::PreparedStatement> debit(con->prepareStatement(
            "UPDATE accounts SET balance=balance-? WHERE id=? AND balance>=?"));
        debit->setInt(1,100); debit->setInt(2,1); debit->setInt(3,100);
        if(debit->executeUpdate()!=1) throw std::runtime_error("insufficient funds or missing account");
        std::unique_ptr<sql::PreparedStatement> credit(con->prepareStatement(
            "UPDATE accounts SET balance=balance+? WHERE id=?"));
        credit->setInt(1,100); credit->setInt(2,2);
        if(credit->executeUpdate()!=1) throw std::runtime_error("missing recipient");
        con->commit(); std::cout<<"committed";
    } catch(const std::exception& e) {
        if(con) { try { con->rollback(); } catch(...) {} }
        std::cerr<<e.what(); return 1;
    }
}`;
const TX_PY = `# pip install mysql-connector-python
import os
import mysql.connector
con = mysql.connector.connect(host="127.0.0.1", user="root",
    password=os.environ["MYSQL_PASSWORD"], database="cs_atlas", autocommit=False)
cur = con.cursor()
try:
    cur.execute("UPDATE accounts SET balance=balance-%s WHERE id=%s AND balance>=%s", (100,1,100))
    if cur.rowcount != 1:
        raise ValueError("insufficient funds or missing account")
    cur.execute("UPDATE accounts SET balance=balance+%s WHERE id=%s", (100,2))
    if cur.rowcount != 1:
        raise ValueError("missing recipient")
    con.commit()
    print("committed")
except Exception:
    con.rollback()
    raise
finally:
    cur.close()
    con.close()`;
lesson('transaction','sql','事务与原子性','ACID · 提交 · 回滚','事务与一致性',25,
 [['两次更新，一个整体','转账需要扣款和入账同时成功。事务把多条修改组织为一个工作单元，提交使更改生效，回滚撤销尚未提交的更改。练习使用支持事务的 InnoDB 表。'],['让校验与更新保持一致','扣款语句把余额条件写入 WHERE，通过受影响行数判断成功，避免先读余额再单独扣款的竞争窗口。入账目标不存在时，也要回滚扣款。'],['区分教学示例与完整系统','示例固定正金额 100，只演示一次事务。实际支付还需请求幂等、身份权限、错误重试、审计与精确金额处理。遇到死锁时，应根据业务策略重试整个事务。']],
 '不要在事务中穿插可能隐式提交的 DDL。示例每运行一次都会再转账一次；练习前检查账户余额。','两次带主键条件的更新；实际延迟取决于锁等待、存储与提交开销。',
 TX_CPP,TX_PY,'committed（初始余额 500、100 运行一次后为 400、200）',
 ['事务的原子性意味着？',['事务永不失败','多个修改全部完成或全部撤销','永远无锁','所有查询更快'],1,'原子性关注整体成功或整体回滚，不承诺无失败或无锁。'],
 ['扣款成功，但目标账户不存在，应如何处理？',['只提交扣款','回滚整个事务','忽略错误','再次扣款'],1,'否则资金会从源账户消失却没有进入目标账户。'],
 '在 InnoDB 的 accounts 表中，从账户 1 向账户 2 转账 100。余额不足或任何账户不存在时回滚；成功后提交。只能在专用练习库操作。',
 '-- 下面展示事务结构；检查行数的条件分支见 C++ / Python 实现\nSTART TRANSACTION;\nUPDATE accounts SET balance=balance-100\nWHERE id=1 AND balance>=100;\n-- 应用必须检查 affected rows = 1，否则 ROLLBACK\nUPDATE accounts SET balance=balance+100 WHERE id=2;\n-- 应用必须检查 affected rows = 1，否则 ROLLBACK\nCOMMIT;');

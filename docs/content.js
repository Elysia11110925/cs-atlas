/* 原创课程与练习。C++17 / Python 3；MySQL 示例需安装各自连接器。 */
const CATEGORIES = [
 {id:'stl',name:'C++ STL',en:'STANDARD TEMPLATE LIBRARY',icon:'▤',color:'green',desc:'从容器到迭代器，让标准库成为你的工具箱。',tags:['vector','unordered_map','set','priority_queue'],level:'基础 → 进阶'},
 {id:'ds',name:'数据结构',en:'DATA STRUCTURES',icon:'⑂',color:'blue',desc:'理解数据的组织方式，建立解决问题的底层直觉。',tags:['链表','栈','队列','二叉树'],level:'基础 → 进阶'},
 {id:'algo',name:'算法',en:'ALGORITHMS',icon:'⌘',color:'purple',desc:'从一次查找到一条最短路径，练习有章法的思考。',tags:['二分查找','归并排序','BFS','动态规划'],level:'基础 → 进阶'},
 {id:'sql',name:'MySQL 数据库',en:'DATABASE SYSTEMS',icon:'▱',color:'amber',desc:'学会查询、关联与事务，让数据回答你的问题。',tags:['SELECT','JOIN','GROUP BY','事务'],level:'入门 → 应用'},
 {id:'net',name:'计算机网络',en:'COMPUTER NETWORKS',icon:'◎',color:'teal',desc:'跟随一个数据包，理解计算机之间如何对话。',tags:['分层模型','IPv4','TCP','HTTP'],level:'基础 → 应用'},
 {id:'compiler',name:'编译原理',en:'COMPILER DESIGN',icon:'⟨/⟩',color:'rose',desc:'从字符到语法树，亲手走过一段程序的诞生。',tags:['词法分析','递归下降','表达式','常量折叠'],level:'基础 → 进阶'}
];
const LESSONS = [];
function lesson(id,cat,title,subtitle,group,minutes,concepts,pitfall,complexity,cpp,python,output,easy,medium,challenge,sql='') {
 LESSONS.push({id,cat,title,subtitle,group,minutes,concepts,pitfall,complexity,cpp,python,output,sql,
 questions:[{type:'choice',difficulty:1,prompt:easy[0],options:easy[1],answer:easy[2],explanation:easy[3]},{type:'choice',difficulty:2,prompt:medium[0],options:medium[1],answer:medium[2],explanation:medium[3]},{type:'code',difficulty:3,prompt:challenge,explanation:'参考本节的完整实现。先核对输入、输出与边界情况，再比较解题步骤；实现方式可以不同。',cpp,python,sql}]});
}
lesson('vector','stl','vector 动态数组','连续存储 · 扩容 · 遍历','顺序容器',18,
 [['为什么需要动态数组','vector 将元素连续存放，支持按下标随机访问，并在容量不足时申请更大的存储空间。size 是现有元素数，capacity 是可容纳的元素数。Python 的 list 在常见实现中也是动态数组，但存放的是对象引用。'],['把一次操作放进时间尺度','按下标访问是 O(1)，尾部 push_back 的摊还成本是 O(1)，一次扩容可能是 O(n)。中间插入、删除需要移动后续元素。reserve 只预留容量，resize 才改变元素数量。'],['实践：保留第一次出现的元素','从左到右遍历输入，用一个集合记录已经见过的值，只把第一次出现的值追加到结果。结果仍按原始出现顺序排列。']],
 '扩容可能使迭代器、指针与引用失效。遍历时直接 erase 后继续递增旧迭代器也可能出错；使用 erase 返回的新迭代器。','平均 O(n) 时间，O(n) 额外空间（哈希集合）。',
 String.raw`#include <iostream>
#include <vector>
#include <unordered_set>
std::vector<int> unique_first(const std::vector<int>& a) {
    std::unordered_set<int> seen;
    std::vector<int> result;
    for (int x : a)
        if (seen.insert(x).second) result.push_back(x);
    return result;
}
int main() {
    for (int x : unique_first({3, 1, 3, 2, 1})) std::cout << x << ' ';
}`,`def unique_first(a):
    seen, result = set(), []
    for x in a:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result

print(*unique_first([3, 1, 3, 2, 1]))`, '3 1 2',
 ['reserve(100) 对空 vector 的 size 有何影响？',['变为 100','仍为 0','变为 1','取决于元素类型'],1,'reserve 仅保证容量至少达到参数，不构造新元素。'],
 ['对 [1,2,3,4] 删除下标 1 的元素后，内容是？',['[1,3,4]','[2,3,4]','[1,2,4]','[1,0,3,4]'],0,'下标从 0 开始，删除 2，后面的元素向左移动。'],
 '实现 unique_first：删除整数序列的重复值，保留第一次出现的顺序。输入 [3,1,3,2,1]，输出 [3,1,2]。空数组应返回空数组，考虑负数。');
lesson('unordered-map','stl','unordered_map 哈希映射','键值对 · 计数 · 平均复杂度','关联容器',20,
 [['从键定位到值','unordered_map 使用哈希组织唯一键。查找、插入和删除平均 O(1)，最坏可能 O(n)。Python 的 dict 可表达键值映射，但不要依赖 C++ unordered_map 的遍历顺序。'],['访问与查询的区别','C++ 的 m[key] 在键不存在时会插入默认值。只检查存在性时使用 find；Python 的 d[key] 对缺失键会抛出 KeyError，d.get(key, 0) 则返回默认值且不插入。'],['实践：频次统计','逐个读入单词并累加计数，再按指定查询顺序取值。把输入顺序和哈希表内部顺序分开，才能得到可预测的输出。']],
 '哈希表不是有序表。迭代顺序无法用来寻找最小键；rehash 也会使迭代器失效。','平均 O(n+q) 时间，O(k) 空间，k 为不同键数量。',
 String.raw`#include <iostream>
#include <string>
#include <vector>
#include <unordered_map>
int main() {
    std::vector<std::string> words = {"red", "blue", "red"};
    std::unordered_map<std::string, int> freq;
    for (const auto& w : words) ++freq[w];
    for (const std::string w : {"red", "blue", "green"}) {
        auto it = freq.find(w);
        std::cout << w << ':' << (it == freq.end() ? 0 : it->second) << '\n';
    }
}`,`words = ["red", "blue", "red"]
freq = {}
for word in words:
    freq[word] = freq.get(word, 0) + 1
for word in ["red", "blue", "green"]:
    print(f"{word}:{freq.get(word, 0)}")`, 'red:2\nblue:1\ngreen:0',
 ['unordered_map 默认保证哪一项？',['按键升序','按插入顺序','键唯一','最坏 O(1) 查找'],2,'键唯一；遍历无序，极端冲突时查找可退化。'],
 ['空的 unordered_map<string,int> m 执行 m["a"]++ 后，m["a"] 是？',['未定义','0','1','抛出异常'],2,'缺失键先插入值初始化的 int（0），再自增到 1。'],
 '统计 ["red","blue","red"] 的频次，并依次查询 red、blue、green。未出现的单词显示 0，查询缺失键时不要修改词频表。');
lesson('set','stl','set 有序集合','去重 · 顺序 · 范围查询','关联容器',16,
 [['用顺序换取范围能力','std::set 存放唯一元素，按比较器排序；查找和更新为 O(log n)。Python 的 set 只提供无序去重，本节用 sorted(set(...)) 产生有序快照，它不等于可动态更新的有序树。'],['lower_bound 的含义','set.lower_bound(x) 返回第一个不小于 x 的元素。它可能返回 end，因此必须先检查。Python 对排好序的列表使用 bisect_left 找到同样的插入位置。'],['实践：找到下一个可用值','对 [7,2,7,9,4] 去重排序，查找不小于 5 的最小值。先得到 [2,4,7,9]，答案为 7。']],
 '不要对 end 迭代器解引用。对 set 使用通用 std::lower_bound 可能进行线性次数的迭代器移动，优先使用成员函数。','C++ 建表 O(n log n)、查询 O(log n)；Python 排序 O(n log n)、二分 O(log n)。',
 String.raw`#include <iostream>
#include <set>
int main() {
    std::set<int> values = {7, 2, 7, 9, 4};
    auto it = values.lower_bound(5);
    if (it != values.end()) std::cout << *it;
    else std::cout << "NONE";
}`,`from bisect import bisect_left
values = sorted(set([7, 2, 7, 9, 4]))
i = bisect_left(values, 5)
print(values[i] if i < len(values) else "NONE")`, '7',
 ['std::set<int> 默认如何遍历？',['降序且重复','升序且不重复','插入顺序','随机且可重复'],1,'默认 std::less 比较器产生升序，等价键只保留一个。'],
 ['集合 {2,4,7,9} 的 lower_bound(7) 指向？',['4','7','9','end'],1,'lower_bound 包含等于；upper_bound 才寻找严格大于的值。'],
 '对 [7,2,7,9,4] 去重，找出不小于 5 的最小元素；若不存在输出 NONE。把阈值改为 10，验证不存在的分支。');
lesson('priority-queue','stl','priority_queue 优先队列','堆 · Top K · 优先级','容器适配器',22,
 [['先处理优先级最高的项','priority_queue 是容器适配器，默认把最大元素放在 top。push、pop 为 O(log n)，top 为 O(1)。Python 的 heapq 默认维护最小堆。'],['保留最大的 k 个数','维护大小不超过 k 的最小堆。每次插入一个数，超出 k 就弹出最小值。最终堆内保留最大的 k 个数，堆顶是第 k 大。'],['理解不变量','处理任意前缀后，堆始终保留该前缀的最大 k 项（元素不够时全部保留）。重复值算不同位置的元素，不会自动去重。']],
 'C++ pop() 不返回被移除的值，先 top() 再 pop()。k 必须满足 1 ≤ k ≤ n。','O(n log k) 时间，O(k) 空间。',
 String.raw`#include <iostream>
#include <vector>
#include <queue>
#include <functional>
int main() {
    std::vector<int> a = {5, 1, 9, 3, 7};
    const int k = 2;
    if (k < 1 || k > static_cast<int>(a.size())) return 1;
    std::priority_queue<int, std::vector<int>, std::greater<int>> heap;
    for (int x : a) {
        heap.push(x);
        if (static_cast<int>(heap.size()) > k) heap.pop();
    }
    std::cout << heap.top();
}`,`import heapq
a, k = [5, 1, 9, 3, 7], 2
if not 1 <= k <= len(a):
    raise ValueError("invalid k")
heap = []
for x in a:
    heapq.heappush(heap, x)
    if len(heap) > k:
        heapq.heappop(heap)
print(heap[0])`, '7',
 ['C++ priority_queue<int> 默认 top() 是？',['最小值','最大值','最早入队值','中位数'],1,'默认是最大堆；greater<int> 可将它变为最小堆。'],
 ['[5,5,2] 的第 2 大元素（不去重）是？',['2','5','不存在','3'],1,'降序排列是 [5,5,2]，重复元素参与排名。'],
 '用大小为 k 的最小堆求第 k 大元素。a=[5,1,9,3,7]、k=2，输出 7。要求不要对整个数组排序，并检查 k 合法性。');
lesson('linked-list','ds','单链表与反转','节点 · 指针 · 原地反转','线性结构',22,
 [['通过链接组织数据','单链表的节点由值和 next 组成，不要求连续存储。已知前驱后可 O(1) 插入或删除，但按位置查找需要 O(n)。'],['三个指针完成反转','prev 指向已经反转的前缀，cur 指向尚未处理的节点；先保存 next，再修改 cur.next，最后推进两个指针。每一步都不会丢失剩余链。'],['先画，再写','对 1→2→3，第一步变成 1→空，剩余 2→3；第二步 2→1，剩余 3；结束时 prev 就是新头。空链的 prev 保持为空。']],
 '先改 next 再读取 next 会丢失原链后缀。C++ 中动态分配节点还需要管理释放；这里使用栈上节点展示链接。','O(n) 时间，O(1) 额外空间。',
 String.raw`#include <iostream>
struct Node { int value; Node* next; };
Node* reverse(Node* head) {
    Node* prev = nullptr;
    while (head) {
        Node* next = head->next;
        head->next = prev;
        prev = head;
        head = next;
    }
    return prev;
}
int main() {
    Node c{3,nullptr}, b{2,&c}, a{1,&b};
    for (Node* p = reverse(&a); p; p = p->next)
        std::cout << p->value << ' ';
}`,`class Node:
    def __init__(self, value, next=None):
        self.value, self.next = value, next

def reverse(head):
    prev = None
    while head:
        nxt = head.next
        head.next = prev
        prev, head = head, nxt
    return prev

p = reverse(Node(1, Node(2, Node(3))))
while p:
    print(p.value, end=" ")
    p = p.next`, '3 2 1',
 ['单链表按下标访问第 n 个节点的复杂度是？',['O(1)','O(log n)','O(n)','O(n²)'],2,'必须从头沿 next 前进。'],
 ['反转节点前保存原 next 的主要原因是？',['保持升序','防止丢失未处理后缀','节省值空间','让节点连续存放'],1,'修改链接会覆盖访问原后继的路径。'],
 '原地反转 1→2→3→空，并输出 3 2 1。不得创建新的链表节点；空链和只有一个节点的链也要正确返回。');
lesson('stack','ds','栈与括号匹配','后进先出 · 嵌套 · 匹配','线性结构',18,
 [['只从一端进入和退出','栈遵循后进先出。函数调用、撤销操作和表达式处理都利用这种嵌套结构。C++ 可用 vector 的尾部操作模拟，Python 用 list.append 与 pop。'],['把未匹配的左括号压栈','遇到左括号就压入；遇到右括号时，它必须匹配最近的左括号。如果栈为空或类型不同，立即失败。最后栈为空才代表全部匹配。'],['边界也是定义的一部分','本节只把括号字符参与匹配，其他字符忽略。因此空字符串和没有括号的文本都合法。([)] 虽然数量相等，但嵌套顺序不合法。']],
 '只统计左右括号数量不能判断嵌套顺序。访问栈顶前必须检查是否为空。','O(n) 时间，O(n) 最坏空间。',
 String.raw`#include <iostream>
#include <string>
#include <vector>
bool valid(const std::string& s) {
    std::vector<char> stack;
    std::string left = "([{", right = ")]}";
    for (char c : s) {
        if (left.find(c) != std::string::npos) stack.push_back(c);
        else {
            auto i = right.find(c);
            if (i == std::string::npos) continue;
            if (stack.empty() || stack.back() != left[i]) return false;
            stack.pop_back();
        }
    }
    return stack.empty();
}
int main() { std::cout << std::boolalpha << valid("([]){}"); }
`, `def valid(s):
    stack = []
    pairs = {')': '(', ']': '[', '}': '{'}
    for c in s:
        if c in '([{':
            stack.append(c)
        elif c in pairs:
            if not stack or stack.pop() != pairs[c]:
                return False
    return not stack

print(str(valid('([]){}')).lower())`, 'true',
 ['栈的出入规则是？',['先进先出','后进先出','按值排序','随机选择'],1,'后进入的元素先离开，适合嵌套问题。'],
 ['哪一个字符串括号合法？',['([)]','(()','{[()]}','] ['],2,'每个右括号都匹配最近的未匹配左括号。'],
 '判断字符串中的 ()、[]、{} 是否正确嵌套，忽略其他字符。测试 ([]){ }（忽略空格）应为 true，([)] 应为 false，空串应为 true。');
lesson('queue','ds','队列与循环缓冲区','先进先出 · 首尾 · 固定容量','线性结构',20,
 [['队列保持到达顺序','队列在尾部加入、头部移除，适合任务调度和广度优先遍历。C++ queue 的 pop 不返回值；Python 的 deque.popleft 返回值，避免 list.pop(0) 的元素搬移。'],['用取模复用数组','循环队列用 head 表示头位置、size 表示元素数。尾部写入位置为 (head+size)%capacity，出队后 head=(head+1)%capacity。'],['区分空和满','维护 size 后，size=0 表示空，size=capacity 表示满。不必浪费一个槽位，但每次修改都要同步维护 size。容量必须大于零。']],
 '仅比较 head 和 tail 无法同时区分空与满，除非增加 size、标志位或预留一个槽。','每次入队/出队 O(1)，存储 O(capacity)。',
 String.raw`#include <iostream>
#include <vector>
#include <stdexcept>
class Ring {
    std::vector<int> a; size_t head=0, count=0;
public:
    explicit Ring(size_t cap): a(cap) { if (!cap) throw std::invalid_argument("capacity"); }
    bool push(int x) {
        if (count == a.size()) return false;
        a[(head+count)%a.size()] = x; ++count; return true;
    }
    int pop() {
        if (!count) throw std::out_of_range("empty");
        int x=a[head]; head=(head+1)%a.size(); --count; return x;
    }
};
int main() { Ring q(2); q.push(10); q.push(20); std::cout<<q.pop()<<' '; q.push(30); std::cout<<q.pop()<<' '<<q.pop(); }
`, `class Ring:
    def __init__(self, capacity):
        if capacity <= 0:
            raise ValueError('capacity')
        self.a, self.head, self.size = [0]*capacity, 0, 0
    def push(self, x):
        if self.size == len(self.a):
            return False
        self.a[(self.head+self.size) % len(self.a)] = x
        self.size += 1
        return True
    def pop(self):
        if not self.size:
            raise IndexError('empty')
        x = self.a[self.head]
        self.head = (self.head+1) % len(self.a)
        self.size -= 1
        return x

q = Ring(2)
q.push(10)
q.push(20)
first = q.pop()
q.push(30)
print(first, q.pop(), q.pop())`, '10 20 30',
 ['队列适合哪一种处理顺序？',['后进先出','先进先出','总是最小值优先','随机顺序'],1,'队列保留任务的到达顺序。'],
 ['容量 4、head=3、size=2 时，下次入队写入哪个下标？',['0','1','2','3'],1,'(3+2)%4=1；已有元素占据下标 3 和 0。'],
 '实现容量为 2 的循环队列。依次入队 10、20，出队一次，入队 30，再连续出队，得到 10 20 30。满时 push 返回 false，空时 pop 报错。');
lesson('tree','ds','二叉树遍历','递归 · 前中后序 · 子问题','树结构',22,
 [['每个节点最多有两个孩子','普通二叉树没有大小顺序要求；二叉搜索树才对左右子树的键施加顺序约束。遍历就是为每个节点约定被访问的时机。'],['中序：左、根、右','先递归处理左子树，再访问当前节点，最后处理右子树。递归入口遇到空节点就返回，它是算法的结束条件。'],['树高决定调用栈','所有节点访问一次，时间 O(n)。调用栈大小取决于树高 h，平衡树为 O(log n)，退化成链时为 O(n)。深树可使用显式栈避免递归深度限制。']],
 '普通二叉树的中序遍历不保证有序。只有满足搜索树约束时，才可得到相应的排序结果。','O(n) 时间，O(h) 调用栈；输出另占 O(n)。',
 String.raw`#include <iostream>
struct Node { int x; Node *left, *right; };
void inorder(Node* p) {
    if (!p) return;
    inorder(p->left);
    std::cout << p->x << ' ';
    inorder(p->right);
}
int main() {
    Node a{1,nullptr,nullptr}, c{3,nullptr,nullptr}, b{2,&a,&c};
    inorder(&b);
}`, `class Node:
    def __init__(self, x, left=None, right=None):
        self.x, self.left, self.right = x, left, right

def inorder(p):
    if p is None:
        return
    yield from inorder(p.left)
    yield p.x
    yield from inorder(p.right)

print(*inorder(Node(2, Node(1), Node(3))))`, '1 2 3',
 ['中序遍历的顺序是？',['根左右','左右根','左根右','右根左'],2,'中序把根放在左右子树之间。'],
 ['根为 2，左孩子 3，右孩子 1，中序结果是？',['1 2 3','2 3 1','3 2 1','3 1 2'],2,'遍历依靠树的结构，而不是元素数值。'],
 '实现二叉树中序遍历。对根 2、左孩子 1、右孩子 3 的树输出 1 2 3，空树不输出元素。说明最坏情况下的递归栈空间。');

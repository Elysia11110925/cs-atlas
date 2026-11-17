lesson('binary-search','algo','二分查找与边界','有序性 · 半开区间 · 不变量','查找与排序',20,
 [['每一步排除一半','二分查找依赖有序或可判定的单调性。本节寻找第一个不小于 target 的位置，与 lower_bound 的语义相同；如果所有元素都更小，返回 n。'],['统一使用 [lo, hi)','初始化 lo=0、hi=n。若 a[mid]<target，答案必在 mid 右侧，令 lo=mid+1；否则 mid 仍可能是答案，令 hi=mid。'],['边界收敛就是答案','lo==hi 时，左边的元素都小于 target，右边的元素都不小于 target。空数组也会直接得到 0，不需要特殊访问。']],
 '不要混用闭区间和半开区间的更新方式。使用 lo+(hi-lo)/2 可避免两个大整数直接相加导致的溢出。','O(log n) 时间，O(1) 空间。',
 String.raw`#include <iostream>
#include <vector>
size_t lower_bound_index(const std::vector<int>& a, int target) {
    size_t lo=0, hi=a.size();
    while (lo<hi) {
        size_t mid=lo+(hi-lo)/2;
        if (a[mid]<target) lo=mid+1;
        else hi=mid;
    }
    return lo;
}
int main() { std::cout<<lower_bound_index({1,2,2,4}, 2); }`,
 `def lower_bound_index(a, target):
    lo, hi = 0, len(a)
    while lo < hi:
        mid = lo + (hi-lo)//2
        if a[mid] < target:
            lo = mid+1
        else:
            hi = mid
    return lo

print(lower_bound_index([1, 2, 2, 4], 2))`, '1',
 ['二分查找每轮通常将候选范围缩小为？',['原来的一半左右','少一个元素','原来的平方','不变'],0,'利用单调性丢弃约一半范围，因此轮数为对数级。'],
 ['对 [1,2,2,4] 求 lower_bound(3) 的下标是？',['1','2','3','4'],2,'第一个不小于 3 的元素是 4，下标为 3。'],
 '手写 lower_bound_index，不调用库函数。对 [1,2,2,4] 查询 2 返回 1；查询 5 返回 4；空数组返回 0。');
lesson('merge-sort','algo','归并排序','分治 · 合并 · 稳定性','查找与排序',24,
 [['先分开，再合并','把数组分成左右两半，分别排好序，再用双指针合并两个有序段。长度小于 2 的区间天然有序，是递归的终点。'],['合并只向前走','每次比较两边尚未处理的首元素，把较小者写入临时数组。某一边耗尽后复制另一边剩余内容。相等时先取左边，保留稳定性。'],['为什么是 n log n','每层合并的总工作量为 O(n)，共有 O(log n) 层。临时数组最大占 O(n)，递归栈为 O(log n)。稳定排序能保留相同键的原相对顺序。']],
 '相等时优先取右边会破坏稳定性。Python 的切片会复制数据；本示例便于理解，仍保持 O(n log n) 时间。','O(n log n) 时间，O(n) 峰值额外空间。',
 String.raw`#include <iostream>
#include <vector>
std::vector<int> merge_sort(std::vector<int> a) {
    if (a.size()<2) return a;
    auto mid=a.begin()+a.size()/2;
    auto left=merge_sort(std::vector<int>(a.begin(),mid));
    auto right=merge_sort(std::vector<int>(mid,a.end()));
    size_t i=0,j=0,k=0;
    while(i<left.size() && j<right.size())
        a[k++]=(left[i]<=right[j] ? left[i++] : right[j++]);
    while(i<left.size()) a[k++]=left[i++];
    while(j<right.size()) a[k++]=right[j++];
    return a;
}
int main() { for(int x:merge_sort({4,1,3,1})) std::cout<<x<<' '; }`,
 `def merge_sort(a):
    if len(a) < 2:
        return a[:]
    mid = len(a)//2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    i = j = 0
    result = []
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    return result + left[i:] + right[j:]

print(*merge_sort([4, 1, 3, 1]))`, '1 1 3 4',
 ['归并排序使用哪种主要策略？',['贪心','分治','随机试探','回溯穷举'],1,'将问题拆成子问题，分别求解后合并。'],
 ['为了让归并排序稳定，左右值相等时应？',['先取右边','先取左边','同时丢弃','随机取一个'],1,'左侧元素在原序列中更早，相等时保留该相对顺序。'],
 '实现稳定归并排序，不调用内置排序。输入 [4,1,3,1] 输出 [1,1,3,4]，空数组与单元素数组保持不变。');
lesson('bfs','algo','BFS 无权最短路','图 · 层次遍历 · 最短距离','图算法',24,
 [['把队列看成距离波前','BFS 从起点逐层扩展：先访问距离 1 的点，再访问距离 2 的点。因此在每条边代价相同的图中，第一次发现节点时得到的就是最短边数。'],['在入队时标记','dist 初始化为 -1 表示未访问，起点为 0。发现未访问的邻居时，先赋值 dist[v]=dist[u]+1，再入队，避免多个父节点重复添加它。'],['图不一定连通','队列清空后，仍为 -1 的节点从起点不可达。本例的邻接表表示无向图：0 连 1、2；1 连 3；2 连 3。从 0 到 3 的最短距离是 2。']],
 '带不同权重的图不能直接用普通 BFS 求最短权重路径。需要根据权重条件选择 0-1 BFS 或 Dijkstra 等算法。','邻接表下 O(V+E) 时间，O(V) 辅助空间。',
 String.raw`#include <iostream>
#include <vector>
#include <queue>
int main() {
    std::vector<std::vector<int>> g={{1,2},{0,3},{0,3},{1,2}};
    std::vector<int> dist(g.size(),-1);
    std::queue<int> q; q.push(0); dist[0]=0;
    while(!q.empty()) {
        int u=q.front(); q.pop();
        for(int v:g[u]) if(dist[v]==-1) {
            dist[v]=dist[u]+1; q.push(v);
        }
    }
    std::cout<<dist[3];
}`, `from collections import deque
g = [[1,2], [0,3], [0,3], [1,2]]
dist = [-1]*len(g)
dist[0] = 0
q = deque([0])
while q:
    u = q.popleft()
    for v in g[u]:
        if dist[v] == -1:
            dist[v] = dist[u]+1
            q.append(v)
print(dist[3])`, '2',
 ['BFS 通常用什么结构保存待访问节点？',['栈','队列','有序集合','二分搜索树'],1,'FIFO 使距离较小的层先被处理。'],
 ['无向边为 0—1、1—2、0—2，从 0 到 2 的最短边数是？',['0','1','2','3'],1,'存在直连边 0—2。'],
 '对邻接表 [[1,2],[0,3],[0,3],[1,2]]，使用 BFS 求节点 0 到 3 的最短边数，输出 2。扩展一个孤立节点，验证其距离保持 -1。');
lesson('dp','algo','动态规划：零钱兑换','状态 · 转移 · 不可达','动态规划',26,
 [['先定义状态再写循环','dp[s] 表示组成金额 s 所需的最少硬币数。dp[0]=0，其他状态初始化为不可达。硬币面值必须是正整数，每种硬币可以无限使用。'],['从最后一枚硬币出发','若最后一枚硬币为 c，前面需组成 s-c，所以 dp[s]=min(dp[s],dp[s-c]+1)。从小到大枚举金额，使依赖的状态已经计算完成。'],['别把贪心当作保证','对面值 [1,3,4]、金额 6，先取最大面值会得到 4+1+1（三枚），最优却是 3+3（两枚）。动态规划系统比较所有可能的最后一枚。']],
 '不要对代表无穷大的整数直接加一导致溢出。这里使用 amount+1 作为哨兵，适用于合理规模的非负金额。','O(amount × 硬币种数) 时间，O(amount) 空间。',
 String.raw`#include <iostream>
#include <vector>
#include <algorithm>
int min_coins(const std::vector<int>& coins, int amount) {
    if(amount<0) return -1;
    std::vector<int> dp(amount+1,amount+1); dp[0]=0;
    for(int s=1;s<=amount;++s)
        for(int c:coins) if(c>0 && c<=s)
            dp[s]=std::min(dp[s],dp[s-c]+1);
    return dp[amount]>amount ? -1 : dp[amount];
}
int main() { std::cout<<min_coins({1,3,4},6); }`,
 `def min_coins(coins, amount):
    if amount < 0:
        return -1
    dp = [amount+1]*(amount+1)
    dp[0] = 0
    for s in range(1, amount+1):
        for c in coins:
            if 0 < c <= s:
                dp[s] = min(dp[s], dp[s-c]+1)
    return dp[amount] if dp[amount] <= amount else -1

print(min_coins([1,3,4], 6))`, '2',
 ['最少硬币问题中 dp[0] 应设为？',['-1','0','1','无穷大'],1,'组成金额 0 需要 0 枚硬币，这是转移的起点。'],
 ['面值 [1,3,4] 组成金额 6 最少用几枚？',['1','2','3','无法组成'],1,'3+3 使用两枚，优于 4+1+1。'],
 '实现不限次数的最少硬币函数，无法组成返回 -1。[1,3,4]、6 返回 2；[2]、3 返回 -1；金额为 0 返回 0。');

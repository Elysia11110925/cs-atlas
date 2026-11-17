/* 原创扩充课程。所有网络代码均为明确范围的教学计算或仿真。 */
(() => {
const MIT='https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/';
const ADV='https://ocw.mit.edu/courses/6-046j-design-and-analysis-of-algorithms-spring-2015/pages/lecture-notes/';
const NET='https://book.systemsapproach.org/';
const C=s=>String.raw`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <numeric>
#include <queue>
#include <stack>
#include <map>
#include <set>
#include <unordered_map>
#include <functional>
#include <sstream>
#include <iomanip>
#include <cmath>
#include <cstdint>
#include <limits>
using namespace std;
`+s;
function add(id,cat,title,group,concepts,pitfall,cost,cpp,py,out,q1,q2,task,source=cat==='algo'?MIT:NET){
 lesson(id,cat,title,concepts.map(c=>c[0]).join(' · '),group,25,concepts,pitfall,cost,C(cpp),py,out,q1,q2,task);
 Object.assign(LESSONS.at(-1),{sources:[[cat==='algo'?'MIT 算法课程参考':'协议 / 网络教材参考',source]],codeKind:cat==='net'?'simulation':'algorithm',outputTestable:true,cppStandard:'C++17'});
}
add('algo-proof','algo','复杂度、循环不变量与递推','算法分析与设计',
 [['操作次数随输入增长','分析前先明确 n 表示元素数、边数还是数值大小。两层循环不必然是 n²；每轮翻倍的内层只有对数次。渐进界忽略常数，不代表具体运行秒数。'],['用不变量证明扫描','前缀最大值算法的断言是：每轮开始时，best 等于已经处理前缀的最大值。检查初始化、循环保持和终止，即可证明最终答案正确。'],['递归也有成本模型','T(n)=2T(n/2)+O(n) 对应归并式分治。不要只数递归层数，还应计算每层的总工作。本例计算最大值，同时统计实际比较次数。']],
 '空序列没有普通意义下的最大元素，接口需要单独定义；此例输入非空。','O(n) 时间，O(1) 额外空间。',
 String.raw`int main(){vector<int>a={3,1,7,2};int best=a[0],count=0;for(size_t i=1;i<a.size();++i){++count;best=max(best,a[i]);}cout<<best<<' '<<count;}`,
 String.raw`a=[3,1,7,2]
best,count=a[0],0
for x in a[1:]:
    count+=1
    best=max(best,x)
print(best,count)`, '7 3',
 ['扫描 n 个元素求最大值需要几次比较（n≥1）？',['n²','n-1','log n','0'],1,'以第一个值为候选，每个剩余值比较一次。'],
 ['变量从 1 开始每轮翻倍直到达到 n，迭代次数是？',['O(n)','O(n²)','O(log n)','O(2ⁿ)'],2,'约 log₂n 次翻倍即可达到 n。'],
 '计算 [3,1,7,2] 的最大值及比较次数，输出 7 3，并写出循环不变量。');
add('algo-elementary-sort','algo','插入排序、选择排序与稳定性','查找与排序',
 [['有序前缀逐步扩大','插入排序先保存当前 key，把前面严格大于 key 的元素右移，再填回空位。每轮后前缀有序，相等元素不跨越即可稳定。'],['选择最小值并不等于稳定','选择排序每轮找剩余最小值交换到前面，比较次数固定为二次级。一次远距离交换可能打乱相等键的原始顺序。'],['根据输入选择方法','插入排序在已经有序的数组上接近线性，适合小规模或近乎有序数据。本节实现插入排序，并比较它与选择排序的交换行为。']],
 '先保存 key 再移动，否则会覆盖待插入的值。','最坏 O(n²)，最好 O(n)，额外 O(1)。',
 String.raw`int main(){vector<int>a={4,2,3,2};for(int i=1;i<(int)a.size();++i){int key=a[i],j=i-1;while(j>=0&&a[j]>key){a[j+1]=a[j];--j;}a[j+1]=key;}for(int x:a)cout<<x<<' ';}`,
 String.raw`a=[4,2,3,2]
for i in range(1,len(a)):
    key,j=a[i],i-1
    while j>=0 and a[j]>key:
        a[j+1]=a[j];j-=1
    a[j+1]=key
print(*a)`, '2 2 3 4',
 ['稳定插入排序应移动？',['大于或等于 key','严格大于 key','所有元素','严格小于 key'],1,'相等元素不跨越，保持原相对位置。'],
 ['升序输入上插入排序的最好时间是？',['O(n)','O(n²)','O(log n)','O(1)'],0,'每轮一次比较便结束。'],
 '手写稳定插入排序，将 [4,2,3,2] 排成 [2,2,3,4]；说明选择排序为何不天然稳定。');
add('algo-quickselect','algo','快速排序与第 k 小选择','查找与排序',
 [['分区把枢轴放到最终位置','一轮分区把不大于 pivot 的值移动到左边，再把 pivot 放到分界处。快速排序继续两边，快速选择只继续包含目标排名的一边。'],['性能取决于分区质量','平衡分区带来良好平均性能，连续极端分区可能退化到二次时间。随机枢轴降低固定坏输入的风险，但不改变最坏复杂度上界。'],['选择无需全排序','枢轴位置等于 k-1 时即可停止；否则丢弃不含目标的一侧。重复元素仍按位置计入排名。本例使用末尾枢轴展示原地选择。']],
 'k 是一基排名，要求 1≤k≤n。示例未提供对抗性输入的随机枢轴保护。','平均 O(n)，最坏 O(n²)，原地迭代额外 O(1)。',
 String.raw`int selectk(vector<int>&a,int k){int lo=0,hi=(int)a.size()-1;while(lo<=hi){int pivot=a[hi],p=lo;for(int j=lo;j<hi;++j)if(a[j]<=pivot)swap(a[p++],a[j]);swap(a[p],a[hi]);if(p==k-1)return a[p];if(p<k-1)lo=p+1;else hi=p-1;}return -1;}int main(){vector<int>a={7,2,5,1,4};cout<<selectk(a,3);}`,
 String.raw`def selectk(a,k):
    if not 1<=k<=len(a):raise ValueError('k')
    lo,hi=0,len(a)-1
    while lo<=hi:
        p,pivot=lo,a[hi]
        for j in range(lo,hi):
            if a[j]<=pivot:a[p],a[j]=a[j],a[p];p+=1
        a[p],a[hi]=a[hi],a[p]
        if p==k-1:return a[p]
        if p<k-1:lo=p+1
        else:hi=p-1
print(selectk([7,2,5,1,4],3))`, '4',
 ['快速选择通常继续处理？',['两边全部','只含目标的一边','不处理','完整原数组'],1,'另一侧不含目标排名，可以丢弃。'],
 ['[2,2,5] 第 2 小元素是？',['2','5','不存在','0'],0,'重复值参与排名。'],
 '不用全排序求 [7,2,5,1,4] 第 3 小元素，输出 4；解释可以舍弃另一侧的依据。');
add('algo-heapsort','algo','堆排序与自底向上建堆','查找与排序',
 [['堆只有局部顺序','最大堆要求父节点不小于孩子，而不要求整个数组有序。零基数组中孩子下标为 2i+1 和 2i+2。'],['从叶子附近开始下沉','从最后一个非叶节点向根执行下沉可在线性时间建堆。随后将堆顶换到末尾，缩小堆范围并再次下沉。'],['原地但不稳定','堆排序最坏也为 O(n log n)，辅助空间很小。远距离交换会破坏相等键的原相对次序，因此普通堆排序不稳定。']],
 '已确定的有序后缀不能再参与堆比较，必须传入当前有效长度。','建堆 O(n)，排序 O(n log n)，额外 O(1)。',
 String.raw`void down(vector<int>&a,int n,int i){while(2*i+1<n){int j=2*i+1;if(j+1<n&&a[j+1]>a[j])++j;if(a[i]>=a[j])break;swap(a[i],a[j]);i=j;}}int main(){vector<int>a={5,1,4,2};for(int i=(int)a.size()/2-1;i>=0;--i)down(a,a.size(),i);for(int n=a.size()-1;n>0;--n){swap(a[0],a[n]);down(a,n,0);}for(int x:a)cout<<x<<' ';}`,
 String.raw`def down(a,n,i):
    while 2*i+1<n:
        j=2*i+1
        if j+1<n and a[j+1]>a[j]:j+=1
        if a[i]>=a[j]:break
        a[i],a[j]=a[j],a[i];i=j
a=[5,1,4,2]
for i in range(len(a)//2-1,-1,-1):down(a,len(a),i)
for n in range(len(a)-1,0,-1):
    a[0],a[n]=a[n],a[0];down(a,n,0)
print(*a)`, '1 2 4 5',
 ['最大堆的根是？',['最小值','最大值','中位数','最后插入值'],1,'沿父子路径可推出根不小于所有节点。'],
 ['自底向上建堆的时间是？',['O(log n)','O(n)','O(n log n)','O(n²)'],1,'多数节点靠近底部，按高度加权总成本为线性。'],
 '手写下沉与堆排序，把 [5,1,4,2] 排成升序，不调用内置排序或优先队列。');
add('algo-counting-radix','algo','计数排序与基数排序','查找与排序',
 [['使用整数键范围','计数排序为每个键记录频次，适合小键域。它利用了键的结构，因此不受纯比较排序的 Ω(n log n) 下界限制。'],['稳定计数连接基数排序','对计数做前缀和并从右向左分配元素，可实现稳定计数排序。LSD 基数排序从低位到高位，每轮必须稳定以保留此前位次顺序。'],['键域也是输入成本','若键的最大值远大于元素数，计数数组会浪费空间。本例限定 0..9 非负整数；处理负数需要偏移或专门编码。']],
 '不要把基数排序每轮换成不稳定排序。','计数 O(n+K) 时间和 O(K) 空间；d 位基数排序 O(d(n+b))。',
 String.raw`int main(){vector<int>a={3,1,3,0,2},count(10);for(int x:a)++count[x];for(int x=0;x<10;++x)for(int k=0;k<count[x];++k)cout<<x<<' ';}`,
 String.raw`a=[3,1,3,0,2]
count=[0]*10
for x in a:count[x]+=1
print(*[x for x in range(10) for _ in range(count[x])])`, '0 1 2 3 3',
 ['计数排序最依赖什么条件？',['键域适中','必须已排序','长度为偶数','所有键相同'],0,'成本包含键域 K。'],
 ['LSD 基数排序每轮必须？',['稳定','递归','随机','常数空间'],0,'稳定性保护低位排序结果。'],
 '用长度 10 的计数数组排序 [3,1,3,0,2]；说明稳定计数如何用于多位整数排序。');
add('algo-two-pointers','algo','双指针与有序两数和','线性扫描技巧',
 [['有序性支持单向移动','升序数组两端之和太小时左端右移，太大时右端左移。每一步都利用单调性排除一批不可能配对。'],['不变量解释排除','若 a[l]+a[r]<target，则当前 l 与任何不大于 r 的元素都太小，故丢弃 l 不会丢失答案。另一侧同理。'],['输入与返回值先约定','本节寻找不同下标的一组解，返回零基位置；无解输出 NONE。同向双指针还可用于合并、去重与连续窗口。']],
 '无序数组不能套用移动规则；先排序则需保存原下标。','O(n) 时间，O(1) 空间。',
 String.raw`int main(){vector<int>a={1,2,4,7,11};int l=0,r=a.size()-1,target=9;while(l<r){int sum=a[l]+a[r];if(sum==target){cout<<l<<' '<<r;return 0;}if(sum<target)++l;else --r;}cout<<"NONE";}`,
 String.raw`a,target=[1,2,4,7,11],9
l,r=0,len(a)-1
while l<r:
    total=a[l]+a[r]
    if total==target:print(l,r);break
    if total<target:l+=1
    else:r-=1
else:print('NONE')`, '1 3',
 ['左右夹逼两数和通常要求数组？',['升序','无重复','全负数','偶数长度'],0,'有序性保证移动能排除不可能项。'],
 ['当前和小于目标时应？',['右指针左移','左指针右移','立即无解','指针不动'],1,'增大左端值才可能增大和。'],
 '在 [1,2,4,7,11] 中寻找和为 9 的不同下标，输出 1 3；无解返回 NONE。');
add('algo-window','algo','滑动窗口：最长无重复子串','线性扫描技巧',
 [['连续区间保持合法','滑动窗口维护连续范围，左右边界只向右移动。加入新字符后，如果重复出现在当前窗口内，就收缩左边界直到恢复合法。'],['记录最后出现位置','将 left 更新为 max(left,last[c]+1)，避免窗口外的旧字符使左边界倒退。每轮以 right-left+1 更新最大长度。'],['字符的单位要一致','本例处理 ASCII，C++ 用字节下标，Python 用字符下标。涉及 Unicode 时应明确是字节、码点还是用户看到的字素，不能默认等价。']],
 'abba 中最后的 a 旧位置已在窗口之外，无条件赋值 last[a]+1 会错误扩大窗口。','O(n) 时间，O(字符集大小) 空间。',
 String.raw`int main(){string s="abba";vector<int>last(256,-1);int left=0,best=0;for(int r=0;r<(int)s.size();++r){unsigned char c=s[r];left=max(left,last[c]+1);last[c]=r;best=max(best,r-left+1);}cout<<best;}`,
 String.raw`s='abba';last={};left=best=0
for right,c in enumerate(s):
    left=max(left,last.get(c,-1)+1)
    last[c]=right
    best=max(best,right-left+1)
print(best)`, '2',
 ['滑动窗口表示？',['任意子集','连续区间','所有排列','树的子集'],1,'左右边界确定连续范围。'],
 ['abba 的最长无重复子串长度是？',['1','2','3','4'],1,'ab 或 ba 都为长度 2。'],
 '用最后出现位置计算 abba 的最长无重复子串长度，输出 2；空串应输出 0。');
add('algo-prefix-difference','algo','前缀和、差分与区间操作','线性扫描技巧',
 [['前缀相减得到区间和','令 P[0]=0，P[i+1]=P[i]+a[i]，则半开区间 [l,r) 的和为 P[r]-P[l]。哨兵 P[0] 统一了从数组起点查询的情况。'],['差分只改两个端点','对 [l,r) 加 v，修改 diff[l]+=v、diff[r]-=v，然后一次前缀累加还原所有位置。起点开始作用，右端停止作用。'],['离线操作与在线查询','差分适合集中修改后统一读取。若修改和区间查询交错，应考虑 Fenwick 或线段树。本例从零数组开始执行两次区间增加。']],
 '统一半开区间，diff 分配 n+1。累计值可能超出单元素范围，用足够宽的整数。','O(n+q) 时间，O(n) 空间。',
 String.raw`int main(){int n=5;vector<long long>d(n+1);auto add=[&](int l,int r,int v){d[l]+=v;d[r]-=v;};add(1,4,3);add(2,5,2);long long cur=0;for(int i=0;i<n;++i){cur+=d[i];cout<<cur<<' ';}}`,
 String.raw`n=5;d=[0]*(n+1)
for l,r,v in [(1,4,3),(2,5,2)]:
    d[l]+=v;d[r]-=v
cur=0;result=[]
for x in d[:n]:
    cur+=x;result.append(cur)
print(*result)`, '0 3 5 5 2',
 ['[l,r) 区间和等于？',['P[r]+P[l]','P[r]-P[l]','P[l]-P[r]','P[r-1]'],1,'两个前缀之差留下 l 到 r-1。'],
 ['差分对 [l,r) 加 v 应？',['只改 l','diff[l]+=v 且 diff[r]-=v','只改 r','两处都加 v'],1,'两端分别开启和关闭增量。'],
 '长度 5 的零数组对 [1,4) 加 3、[2,5) 加 2，使用差分输出 0 3 5 5 2。');
add('algo-backtracking','algo','递归、回溯与子集枚举','算法分析与设计',
 [['选择形成搜索树','对第 i 个位置有选和不选两个分支，到达末尾时得到一个子集。递归参数要足以描述已做的决定与待解决任务。'],['回溯恢复现场','若使用共享路径数组，加入后递归，返回后弹出，才能继续兄弟分支。本例把当前和按值传递，省去显式撤销。'],['剪枝依赖输入假设','只有剩余值非负时，当前和超过目标才可作为某些剪枝依据。有负数的输入可能在后续减小总和。本节不剪枝以保持任意小整数输入的正确性。']],
 '重复值按位置区分子集；若要输出唯一数值集合，还需定义去重。','O(2ⁿ) 时间，O(n) 调用栈。',
 String.raw`int dfs(const vector<int>&a,int i,int sum){if(i==(int)a.size())return sum==3;return dfs(a,i+1,sum)+dfs(a,i+1,sum+a[i]);}int main(){cout<<dfs({1,2,3},0,0);}`,
 String.raw`def count(a,i,total):
    if i==len(a):return int(total==3)
    return count(a,i+1,total)+count(a,i+1,total+a[i])
print(count([1,2,3],0,0))`, '2',
 ['n 个位置共有几个位置子集？',['n','n²','2ⁿ','n!'],2,'每个位置独立选或不选。'],
 ['[1,2,3] 中和为 3 的子集数？',['1','2','3','4'],1,'{3} 和 {1,2}。'],
 '递归统计 [1,2,3] 中和为 3 的位置子集，输出 2；解释为什么含负数时不能随意按当前和剪枝。');
add('algo-greedy-interval','algo','贪心、交换论证与区间调度','算法分析与设计',
 [['局部选择需要全局证明','最大化不重叠活动数量时，优先结束最早的活动，可为后续保留更多可用时间。并非所有看似合理的局部规则都正确。'],['把最优解换成贪心形状','将任意最优解首个活动换成结束更早的候选，不会损失后续活动。反复交换得到包含贪心选择的最优解。'],['目标改变，算法可能改变','本节最大化数量且使用半开区间。如果活动具有不同收益，需要带权区间动态规划，不能直接套用最早结束规则。']],
 '开始最早和持续最短都不保证最优数量。允许一个活动结束时另一个立即开始。','O(n log n) 时间，排序存储视实现而定。',
 String.raw`int main(){vector<pair<int,int>>a={{0,3},{1,2},{2,4},{3,5},{4,6}};sort(a.begin(),a.end(),[](auto x,auto y){return x.second<y.second;});int last=numeric_limits<int>::min(),count=0;for(auto [l,r]:a)if(l>=last){++count;last=r;}cout<<count;}`,
 String.raw`a=[(0,3),(1,2),(2,4),(3,5),(4,6)]
last=float('-inf');count=0
for l,r in sorted(a,key=lambda x:x[1]):
    if l>=last:count+=1;last=r
print(count)`, '3',
 ['最大活动数量的经典贪心优先选？',['最早结束','最早开始','最长持续','最高编号'],0,'最早结束留下最多时间。'],
 ['加入不同收益后，该规则保证最大收益吗？',['始终保证','排序后保证','一般不保证','无需考虑收益'],2,'最大数量与最大收益是不同目标。'],
 '求 [(0,3),(1,2),(2,4),(3,5),(4,6)] 最多互不重叠活动数，输出 3，并给出交换论证。',ADV);
add('algo-dfs','algo','DFS 与无向连通分量','图算法',
 [['沿路径深入再回退','DFS 用递归或显式栈深入邻居。与按层扩散的 BFS 不同，DFS 更自然地记录进入和退出时刻，用于许多结构分析。'],['从所有未访问点启动','一次 DFS 只能覆盖一个起点的可达范围。遍历所有节点，遇到未访问点就启动新搜索，即得到无向图连通分量数。'],['图必须有访问标记','图中可能有环，访问后再探索邻居，防止无限绕圈。本例入栈时标记，确保每个节点最多入栈一次。']],
 '有向图的可达范围不能直接当作强连通分量；本节只统计无向连通分量。','O(V+E) 时间，O(V) 辅助空间。',
 String.raw`int main(){vector<vector<int>>g={{1},{0,2},{1},{4},{3}};vector<int>vis(g.size());int count=0;for(int s=0;s<(int)g.size();++s)if(!vis[s]){++count;stack<int>q;q.push(s);vis[s]=1;while(!q.empty()){int u=q.top();q.pop();for(int v:g[u])if(!vis[v]){vis[v]=1;q.push(v);}}}cout<<count;}`,
 String.raw`g=[[1],[0,2],[1],[4],[3]]
seen=set();count=0
for s in range(len(g)):
    if s in seen:continue
    count+=1;todo=[s];seen.add(s)
    while todo:
        u=todo.pop()
        for v in g[u]:
            if v not in seen:seen.add(v);todo.append(v)
print(count)`, '2',
 ['DFS 对应的工作结构是？',['队列','栈','最小堆','计数桶'],1,'后进入任务先执行，对应栈。'],
 ['边为 0—1、1—2、3—4 的无向图有几个分量？',['1','2','3','5'],1,'{0,1,2} 与 {3,4}。'],
 '用显式栈统计 [[1],[0,2],[1],[4],[3]] 的连通分量，输出 2；加入孤点应得到 3。');
add('algo-topological','algo','拓扑排序与 DAG 依赖','图算法',
 [['边表示先后约束','有向边 u→v 要求 u 在 v 前。拓扑序存在当且仅当没有有向环；多个零入度候选意味着可能有不止一种合法顺序。'],['删除当前可执行节点','Kahn 算法反复取零入度节点，删除其出边，更新邻居入度。新的零入度节点进入候选集合。'],['输出数量检测环','若处理数小于 V，剩余部分含有向环，不能把部分输出当作完成。本例用最小堆使并列候选按编号选择。']],
 '输入若是依赖关系，发现环应报告冲突，而不是随意删边。','普通队列 O(V+E)；本例用堆为 O((V+E)log V) 上界。',
 String.raw`int main(){vector<vector<int>>g={{1,2},{3},{3},{}};vector<int>deg(4);for(auto&vs:g)for(int v:vs)++deg[v];priority_queue<int,vector<int>,greater<int>>q;for(int i=0;i<4;++i)if(!deg[i])q.push(i);vector<int>out;while(!q.empty()){int u=q.top();q.pop();out.push_back(u);for(int v:g[u])if(--deg[v]==0)q.push(v);}if(out.size()!=g.size())cout<<"CYCLE";else for(int x:out)cout<<x<<' ';}`,
 String.raw`import heapq
g=[[1,2],[3],[3],[]];degree=[0]*4
for vs in g:
    for v in vs:degree[v]+=1
q=[i for i,d in enumerate(degree) if d==0];heapq.heapify(q);out=[]
while q:
    u=heapq.heappop(q);out.append(u)
    for v in g[u]:
        degree[v]-=1
        if degree[v]==0:heapq.heappush(q,v)
print(*out) if len(out)==len(g) else print('CYCLE')`, '0 1 2 3',
 ['拓扑序存在要求？',['连通','无向','无有向环','边等权'],2,'DAG 才能满足所有先后约束。'],
 ['只输出 V-1 个节点说明？',['全部成功','存在有向环','有负权','只有一个分量'],1,'剩余部分无法继续取得零入度点。'],
 '对 0→1、0→2、1→3、2→3 输出 0 1 2 3；加入 3→0 后输出 CYCLE。');
// NEXT
add('algo-mst','algo','最小生成树：Kruskal 与 Prim','图算法',
[['跨越所有顶点','生成树在连通无向图中有 V−1 条边。最小生成树最小化总权重，并不保证任意两点之间的树上路径最短。图不连通时只能得到最小生成森林。'],['切分性质指导贪心','Kruskal 按边权升序处理，用并查集跳过成环边；Prim 从一个点开始，每次选择连接树内外的最轻边。两者都依赖切分性质，允许负边权。'],['实现 Kruskal','示例有四点及五条边，排序后接受权重 1、2、3 的边，输出总成本 6。路径压缩维护连通分量，实际工程可再按秩合并。']],
'不要把有向图直接套用普通 MST；并查集必须先判断两个端点是否同根。','排序 O(E log E)，并查集使用路径压缩；空间 O(V+E)。',
String.raw`int main(){struct E{int u,v,w;};vector<E> es{{0,1,1},{1,2,2},{2,3,3},{0,3,9},{0,2,5}};sort(es.begin(),es.end(),[](E a,E b){return a.w<b.w;});vector<int>p{0,1,2,3};function<int(int)>f=[&](int x){return p[x]==x?x:p[x]=f(p[x]);};int cost=0,n=0;for(auto e:es){int a=f(e.u),b=f(e.v);if(a!=b){p[a]=b;cost+=e.w;++n;}}if(n==3)cout<<cost;else cout<<"DISCONNECTED";}`,
`edges = [(1,0,1),(2,1,2),(3,2,3),(9,0,3),(5,0,2)]
p = list(range(4))
def find(x):
    if p[x] != x: p[x] = find(p[x])
    return p[x]
cost = count = 0
for w,u,v in sorted(edges):
    a,b = find(u),find(v)
    if a != b:
        p[a] = b
        cost += w
        count += 1
print(cost if count == 3 else 'DISCONNECTED')`,'6',
['四个顶点的生成树有几条边？',['2','3','4','5'],1,'树的边数是 V−1。'],['MST 是否保证两点间最短路径？',['总是','不保证','仅负权时保证','与边权无关'],1,'MST 优化总边权，与最短路目标不同。'],'对示例五条无向边实现 Kruskal，输出 6；若接受边数不足 V−1 则报告 DISCONNECTED。',ADV);
add('algo-dijkstra','algo','Dijkstra：非负权单源最短路','图算法',
[['距离估计与松弛','dist[v] 保存目前找到的最短路径上界。处理边 u→v 时，若 dist[u]+w 更小就更新。起点为 0，其他点为无穷；不能从无穷距离做加法。'],['小根堆定型','弹出当前最小距离的顶点。在边权非负时，它不会被后续路径改善。允许堆中保留旧记录，但弹出后必须跳过与最新 dist 不一致的记录。'],['示例路径','0→1 权 4，0→2 权 1，2→1 权 2，1→3 权 1，2→3 权 5。最终距离为 0、3、1、4；到 3 的路径经过 2 和 1。']],
'负权边破坏距离定型证明；有负权时应使用 Bellman–Ford 或其他适用算法。','二叉堆实现 O((V+E) log V)，空间 O(V+E)。',
String.raw`int main(){vector<vector<pair<int,int>>>g{{{1,4},{2,1}},{{3,1}},{{1,2},{3,5}}, {}};vector<int>d(4,1000000);priority_queue<pair<int,int>,vector<pair<int,int>>,greater<pair<int,int>>>q;d[0]=0;q.push({0,0});while(!q.empty()){auto [du,u]=q.top();q.pop();if(du!=d[u])continue;for(auto [v,w]:g[u])if(d[v]>du+w){d[v]=du+w;q.push({d[v],v});}}for(int x:d)cout<<x<<' ';}`,
`import heapq
g = [[(1,4),(2,1)],[(3,1)],[(1,2),(3,5)],[]]
d = [float('inf')]*4
d[0] = 0
q = [(0,0)]
while q:
    du,u = heapq.heappop(q)
    if du != d[u]: continue
    for v,w in g[u]:
        if du+w < d[v]:
            d[v] = du+w
            heapq.heappush(q,(d[v],v))
print(*d)`,'0 3 1 4',
['常规 Dijkstra 的边权前提？',['均为负数','非负','均相等','必须为一'],1,'非负边权保证弹出最小距离可定型。'],['堆中旧距离记录应如何处理？',['重新覆盖最新距离','跳过','终止程序','删除所有边'],1,'du != dist[u] 说明该记录已过期。'],'实现堆优化 Dijkstra，计算示例从 0 出发的四个距离，跳过过期堆记录。');
add('algo-bellman-ford','algo','Bellman–Ford 与负环检测','图算法',
[['允许负边','最短路径可以包含负边，但若起点可达的负环能到达目标，则目标没有有限最短距离。Bellman–Ford 不依赖非负边权的定型顺序。'],['重复松弛','任意无重复顶点的路径最多有 V−1 条边。循环扫描全部边 V−1 轮足以找到没有可达负环时的最短距离；一轮没有更新可以提前停止。'],['再检查一轮','若还能从可达顶点改善距离，存在起点可达负环。本例 0→1=4、0→2=5、1→2=−2，结果是 0、4、2。']],
'仅从指定源点运行，不能检测与该源完全不连通的负环；检测全图可增加超级源。','O(VE) 时间，O(V+E) 空间。',
String.raw`int main(){struct E{int u,v,w;};vector<E>es{{0,1,4},{0,2,5},{1,2,-2}};const int INF=1000000;vector<int>d{0,INF,INF};for(int k=0;k<2;k++)for(auto e:es)if(d[e.u]!=INF)d[e.v]=min(d[e.v],d[e.u]+e.w);bool bad=false;for(auto e:es)if(d[e.u]!=INF&&d[e.v]>d[e.u]+e.w)bad=true;if(bad)cout<<"NEGATIVE CYCLE";else for(int x:d)cout<<x<<' ';}`,
`edges = [(0,1,4),(0,2,5),(1,2,-2)]
d = [0,float('inf'),float('inf')]
for _ in range(2):
    for u,v,w in edges:
        if d[u] != float('inf'): d[v] = min(d[v],d[u]+w)
bad = any(d[u] != float('inf') and d[v] > d[u]+w for u,v,w in edges)
if bad: print('NEGATIVE CYCLE')
else: print(*d)`,'0 4 2',
['无重复顶点的路径至多有几条边？',['V−1','V²','E+V','无限'],0,'简单路径最多经过全部 V 个顶点。'],['额外一轮仍可改善可达距离说明？',['图无环','存在可达负环','所有权相同','起点选错'],1,'超过 V−1 条边仍能改善意味着可通过负环继续降低成本。'],'实现 V−1 轮松弛和额外负环检查，示例输出 0 4 2；添加 2→1=−3 后报告负环。');
add('algo-floyd','algo','Floyd–Warshall：全源最短路','图算法',
[['用中间点构造状态','d[i][j] 表示允许已处理顶点作中间点时的最短距离。加入 k 后，要么不用 k，要么路径由 i→k 和 k→j 两段连接。'],['三重循环次序','k 必须在最外层，更新 d[i][j]=min(d[i][j],d[i][k]+d[k][j])。对角线初始化 0，平行边保留最小权，无法到达用无穷表示。'],['适用与边界','适合顶点较少、需要大量点对查询的图。允许负权，但发现 d[i][i]<0 时存在负环，不能把相关结果当作有限最短距离。']],
'有限整数表示无穷时先检查可达性再相加，以免溢出或制造不存在的路径。','O(V³) 时间，O(V²) 空间。',
String.raw`int main(){const int I=1000000;vector<vector<int>>d{{0,3,10},{I,0,2},{I,I,0}};for(int k=0;k<3;k++)for(int i=0;i<3;i++)for(int j=0;j<3;j++)if(d[i][k]<I&&d[k][j]<I)d[i][j]=min(d[i][j],d[i][k]+d[k][j]);cout<<d[0][2];}`,
`I = float('inf')
d = [[0,3,10],[I,0,2],[I,I,0]]
for k in range(3):
    for i in range(3):
        for j in range(3):
            d[i][j] = min(d[i][j],d[i][k]+d[k][j])
print(d[0][2])`,'5',
['Floyd 哪个循环变量放最外层？',['起点 i','终点 j','中间点 k','随意'],2,'状态递推按允许的中间点集合扩展。'],['0→1=3、1→2=2、0→2=10，最短距离？',['10','2','3','5'],3,'经过 1 的距离是 3+2=5。'],'实现 Floyd 并求示例 0 到 2 的距离；C++ 无穷值参与加法前检查可达性。');
add('algo-scc','algo','强连通分量与缩点','图算法',
[['互相可达构成一组','强连通分量是有向图中互相可达的最大顶点集合。无向连通和有向强连通不同：只有一条 u→v 不能说明 u、v 同组。'],['Kosaraju 两次遍历','第一次在原图 DFS，按完成时间记序；第二次按逆完成顺序在反图 DFS，每棵 DFS 树得到一个分量。Tarjan 则用时间戳、lowlink 与栈一次遍历。'],['缩点后的结构','把每个强连通分量压成一个点，得到 DAG，可在其上做拓扑 DP。示例 0↔1、1→2、2↔3 恰有两个分量。']],
'DFS 完成序是在递归返回时记录；把发现序当完成序会破坏算法。','O(V+E) 时间和空间；递归实现需关注深图栈深。',
String.raw`int main(){vector<vector<int>>g{{1},{0,2},{3},{2}},r(4);for(int u=0;u<4;u++)for(int v:g[u])r[v].push_back(u);vector<int>vis(4),order;function<void(int)>dfs=[&](int u){vis[u]=1;for(int v:g[u])if(!vis[v])dfs(v);order.push_back(u);};for(int i=0;i<4;i++)if(!vis[i])dfs(i);fill(vis.begin(),vis.end(),0);function<void(int)>mark=[&](int u){vis[u]=1;for(int v:r[u])if(!vis[v])mark(v);};int count=0;reverse(order.begin(),order.end());for(int u:order)if(!vis[u]){mark(u);count++;}cout<<count;}`,
`g = [[1],[0,2],[3],[2]]
r = [[] for _ in g]
for u,vs in enumerate(g):
    for v in vs: r[v].append(u)
seen,order = set(),[]
def dfs(u):
    seen.add(u)
    for v in g[u]:
        if v not in seen: dfs(v)
    order.append(u)
for u in range(4):
    if u not in seen: dfs(u)
seen.clear()
def mark(u):
    seen.add(u)
    for v in r[u]:
        if v not in seen: mark(v)
count = 0
for u in reversed(order):
    if u not in seen:
        mark(u)
        count += 1
print(count)`,'2',
['强连通要求组内顶点怎样？',['至少一条边','互相可达','权重相同','入度相同'],1,'任意两点都应双向存在路径。'],['强连通分量缩点后一定是？',['完全图','DAG','二叉树','负环'],1,'缩点后若还有环，环上各分量本应合并。'],'用 Kosaraju 统计示例强连通分量数，输出 2，说明两次 DFS 的图和顺序。',ADV);
add('algo-matching','algo','二分图匹配与增广路径','图算法',
[['匹配的约束','二分图顶点分为左右两组，边只跨组。匹配中的任意两条边不能共享端点；最大匹配追求匹配边最多，不等于随意加入边得到的极大匹配。'],['重新安排旧匹配','从未匹配的左点搜索右点；若右点被占用，尝试把其原来的左点改配到别处。每条增广路径会让匹配数增加一。'],['访问标记要重置','每次尝试新的左顶点都重置右侧访问标记，防止本轮递归兜圈。示例左侧邻接表 [[0,1],[0],[1,2]] 可匹配全部三个左点。']],
'同一次增广内不能反复访问同一右点；也不能把所有轮次共用一套永久 visited。','简单 DFS 增广 O(VE)，空间 O(V+E)。Hopcroft–Karp 可改善大图复杂度。',
String.raw`int main(){vector<vector<int>>g{{0,1},{0},{1,2}};vector<int>match(3,-1),seen(3);function<bool(int)>go=[&](int u){for(int v:g[u])if(!seen[v]){seen[v]=1;if(match[v]==-1||go(match[v])){match[v]=u;return true;}}return false;};int ans=0;for(int u=0;u<3;u++){fill(seen.begin(),seen.end(),0);ans+=go(u);}cout<<ans;}`,
`g = [[0,1],[0],[1,2]]
match = [-1]*3
def augment(u,seen):
    for v in g[u]:
        if v in seen: continue
        seen.add(v)
        if match[v] == -1 or augment(match[v],seen):
            match[v] = u
            return True
    return False
print(sum(augment(u,set()) for u in range(3)))`,'3',
['匹配中的两条边能共享端点吗？',['能','不能','只可共享左点','只可共享右点'],1,'一个顶点至多与一条匹配边关联。'],['成功找到增广路径后匹配数量？',['减少一','不变','增加一','翻倍'],2,'交替路径翻转后多出一条匹配边。'],'为三个左点寻找最大匹配，输出 3；每轮增广使用新的 visited。',ADV);
add('algo-maxflow','algo','最大流、残量网络与最小割','图算法',
[['流量守恒与容量','除源汇外，每个点流入量等于流出量，且边流量不超过容量。最大流求源点到汇点可输送的总量，适用于分配、匹配等建模。'],['反向边允许撤销','残量图记录还能增送多少流。沿一条路径增广后，正向容量减少、反向容量增加，后者允许撤回旧选择。Edmonds–Karp 用 BFS 寻找最短增广路。'],['停止条件与最小割','找不到残量路径即达到最大流；源点可达集合给出一个最小割。示例源 0 到汇 3 的边容量为 3、2、1、2、3，总最大流为 5。']],
'只扣减正向容量而不增加反向容量会错误地锁死之前的选择。示例矩阵把平行边容量相加。','Edmonds–Karp O(VE²)，矩阵版本存储 O(V²)。',
String.raw`int main(){vector<vector<int>>r{{0,3,2,0},{0,0,1,2},{0,0,0,3},{0,0,0,0}};int flow=0;while(true){vector<int>p(4,-1);queue<int>q;q.push(0);p[0]=0;while(!q.empty()&&p[3]<0){int u=q.front();q.pop();for(int v=0;v<4;v++)if(p[v]<0&&r[u][v]>0){p[v]=u;q.push(v);}}if(p[3]<0)break;int f=1000000;for(int v=3;v!=0;v=p[v])f=min(f,r[p[v]][v]);for(int v=3;v!=0;v=p[v]){r[p[v]][v]-=f;r[v][p[v]]+=f;}flow+=f;}cout<<flow;}`,
`from collections import deque
r = [[0,3,2,0],[0,0,1,2],[0,0,0,3],[0,0,0,0]]
flow = 0
while True:
    p = [-1]*4
    p[0] = 0
    q = deque([0])
    while q and p[3] < 0:
        u = q.popleft()
        for v in range(4):
            if p[v] < 0 and r[u][v] > 0:
                p[v] = u
                q.append(v)
    if p[3] < 0: break
    f,v = 10**9,3
    while v != 0:
        f = min(f,r[p[v]][v])
        v = p[v]
    v = 3
    while v != 0:
        r[p[v]][v] -= f
        r[v][p[v]] += f
        v = p[v]
    flow += f
print(flow)`,'5',
['残量反向边的作用？',['加密','撤销部分旧流量','让容量无限','删除汇点'],1,'反向残量允许之后重新分配已有流。'],['没有源到汇残量路径说明？',['最大流已达到','原图无边','流为零','图一定有负环'],0,'增广路径定理给出最大流的停止条件。'],'实现 BFS 增广，计算示例最大流 5，并同时更新正反向残量。',ADV);
add('algo-knapsack','algo','0/1 背包与完全背包','动态规划',
[['状态先定义容量','dp[c] 表示容量不超过 c 时的最大价值。对每件物品，可选或不选；0/1 背包每件只能使用一次，完全背包则允许重复。容量离散且可枚举是该方法的前提。'],['循环方向决定含义','0/1 背包容量从大到小遍历，确保读取上一轮状态；完全背包从小到大，让本轮新状态可被再次利用。两者代码只差方向，语义却不同。'],['检查实例','重量 [2,3,4]、价值 [3,4,5]、容量 5，0/1 最优选择前两件，总价值 7。初始化全零代表允许不装满；要求恰好装满时应使用不可达标记。']],
'按数值容量 W 的 O(nW) 属于伪多项式复杂度，W 很大时并不高效。','O(nW) 时间，O(W) 空间。',
String.raw`int main(){vector<int>w{2,3,4},v{3,4,5},d(6);for(int i=0;i<3;i++)for(int c=5;c>=w[i];c--)d[c]=max(d[c],d[c-w[i]]+v[i]);cout<<d[5];}`,
`w,v = [2,3,4],[3,4,5]
d = [0]*6
for wi,vi in zip(w,v):
    for c in range(5,wi-1,-1): d[c] = max(d[c],d[c-wi]+vi)
print(d[5])`,'7',
['0/1 背包容量循环通常怎样走？',['从大到小','从小到大','只算奇数','随机'],0,'降序避免同一物品在本轮被重复使用。'],['示例容量5的最优价值？',['5','6','7','9'],2,'重量2和3、价值3和4组成最优解。'],'实现容量 5 的一维 0/1 背包，输出 7；说明为何不能正序更新。');
add('algo-sequence-dp','algo','序列 DP：LCS、编辑距离与 LIS','动态规划',
[['两个前缀构成状态','LCS 的 dp[i][j] 表示两个字符串前缀的最长公共子序列长度。末字符相同时取对角加一，否则取舍弃某一末字符后的较大值。子序列允许不连续，子串不允许。'],['相关问题改变转移','编辑距离把插入、删除、替换计入成本，取三个候选的最小值。LIS 则在单序列中维护严格递增子序列，可用 O(n²) DP 或二分维护最小结尾。'],['恢复方案要保留选择','本例计算 ABCBDAB 与 BDCABA 的 LCS 长度 4。若需要具体子序列，可沿二维表回溯；滚动数组节省空间却不能直接保留全部回溯信息。']],
'LIS 的严格递增通常用 lower_bound 替换首个不小于 x 的位置；非降序版本边界不同。','本例 LCS O(nm) 时间与空间。',
String.raw`int main(){string a="ABCBDAB",b="BDCABA";vector<vector<int>>d(a.size()+1,vector<int>(b.size()+1));for(size_t i=1;i<=a.size();i++)for(size_t j=1;j<=b.size();j++)d[i][j]=a[i-1]==b[j-1]?d[i-1][j-1]+1:max(d[i-1][j],d[i][j-1]);cout<<d[a.size()][b.size()];}`,
`a,b = 'ABCBDAB','BDCABA'
d = [[0]*(len(b)+1) for _ in range(len(a)+1)]
for i in range(1,len(a)+1):
    for j in range(1,len(b)+1):
        d[i][j] = d[i-1][j-1]+1 if a[i-1] == b[j-1] else max(d[i-1][j],d[i][j-1])
print(d[-1][-1])`,'4',
['公共子序列必须连续吗？',['必须','不必须','仅长度2时必须','取决于语言'],1,'子序列保留相对顺序但允许跳过字符。'],['末字符相同，LCS 转移使用？',['左上角加一','整表清零','左上角减一','直接相乘'],0,'可把相同末字符附加到前缀公共子序列后。'],'计算给定两字符串的 LCS 长度 4，正确初始化空前缀对应的第零行列。');
add('algo-interval-dp','algo','区间 DP：矩阵链乘法','动态规划',
[['按区间定义子问题','dp[l][r] 表示连续矩阵 l 到 r 相乘的最少标量乘法次数。矩阵相乘具有结合律，结果相同，但括号顺序会改变运算量。'],['枚举最后分割点','最后一次乘法在 k 处分开两段，成本是左段、右段与合并成本之和。长度从小到大枚举，保证依赖的短区间已经计算。'],['维度决定成本','10×30、30×5、5×60 三个矩阵先算前两个需 1500+3000=4500 次；先算后两个需 9000+18000=27000 次。示例输出 4500。']],
'区间长度与矩阵维度下标相差一；维度数组长度为矩阵数加一。','O(n³) 时间，O(n²) 空间。',
String.raw`int main(){vector<long long>p{10,30,5,60};int n=3;vector<vector<long long>>d(n,vector<long long>(n));for(int len=2;len<=n;len++)for(int l=0;l+len<=n;l++){int r=l+len-1;d[l][r]=1000000000;for(int k=l;k<r;k++)d[l][r]=min(d[l][r],d[l][k]+d[k+1][r]+p[l]*p[k+1]*p[r+1]);}cout<<d[0][n-1];}`,
`p = [10,30,5,60]
n = len(p)-1
d = [[0]*n for _ in range(n)]
for length in range(2,n+1):
    for l in range(n-length+1):
        r = l+length-1
        d[l][r] = min(d[l][k]+d[k+1][r]+p[l]*p[k+1]*p[r+1] for k in range(l,r))
print(d[0][-1])`,'4500',
['区间 DP 通常按什么顺序计算？',['区间长度递增','全部随机','只看右端点','最长先算'],0,'短区间先完成，长区间才能组合它们。'],['示例最佳标量乘法次数？',['4500','9000','18000','27000'],0,'先算10×30与30×5，再与5×60相乘。'],'实现矩阵链最优成本，使用三维度乘积作为最后一步乘法成本，输出 4500。');
add('algo-tree-dp','algo','树形 DP：最大权独立集','动态规划',
[['父子约束分解','独立集不能同时选择一条边的两个端点。树没有环，固定父节点后，各子树之间只通过父节点发生约束，可独立求解再相加。'],['选或不选两个状态','take[u]=weight[u]+Σskip[v]；skip[u]=Σmax(take[v],skip[v])。先处理子树，再计算父节点，即后序遍历。根答案是两个状态的较大值。'],['实例核对','根权 5、两个孩子权 4 和 3，选根得 5，不选根可同时选两个孩子得 7。本例展示树 DP 的核心转移，换根 DP 则需要进一步汇总父侧贡献。']],
'若输入是普通有环图，直接套树 DP 不成立；无向邻接表 DFS 必须跳过父节点。','O(V) 时间，O(V) 空间与最坏递归栈。',
String.raw`int main(){vector<vector<int>>g{{1,2},{0},{0}};vector<int>w{5,4,3},take(3),skip(3);function<void(int,int)>dfs=[&](int u,int p){take[u]=w[u];for(int v:g[u])if(v!=p){dfs(v,u);take[u]+=skip[v];skip[u]+=max(take[v],skip[v]);}};dfs(0,-1);cout<<max(take[0],skip[0]);}`,
`g,w = [[1,2],[0],[0]],[5,4,3]
def solve(u,parent):
    take,skip = w[u],0
    for v in g[u]:
        if v == parent: continue
        a,b = solve(v,u)
        take += b
        skip += max(a,b)
    return take,skip
print(max(solve(0,-1)))`,'7',
['选择父节点后，其孩子状态必须是？',['选择','不选','翻倍','无约束'],1,'独立集禁止相邻顶点同时被选。'],['示例最大权独立集权和？',['5','7','9','12'],1,'两个孩子互不相邻，可同时选择得到7。'],'实现 take/skip 后序 DP，输出给定三节点树的最优值 7。');
add('algo-bitmask-dp','algo','状态压缩 DP：最小代价分配','动态规划',
[['集合编码为位掩码','用 n 位二进制表示哪些任务已经分配，第 j 位为 1 表示任务 j 已占用。mask 的置位个数决定下一位待分配的工人。'],['从小集合扩展','dp[mask] 为完成该集合所需的最小成本。枚举尚未占用的任务 j，更新 dp[mask|1<<j]。只记录集合即可，因为工人按固定顺序分配。'],['指数算法的适用范围','示例成本矩阵 [[9,2,7],[6,4,3],[5,8,1]] 最优分配成本是 9。状态压缩适合 n 较小的精确求解；n 很大时应考虑匹配等多项式算法。']],
'位移前确认位宽；2^n 状态意味着 n 每增一，内存大致翻倍。','O(n·2^n) 时间，O(2^n) 空间。',
String.raw`int main(){vector<vector<int>>a{{9,2,7},{6,4,3},{5,8,1}};vector<int>d(8,1000000);d[0]=0;for(int m=0;m<7;m++){int i=0;for(int t=m;t;t>>=1)i+=t&1;for(int j=0;j<3;j++)if(!(m&(1<<j)))d[m|(1<<j)]=min(d[m|(1<<j)],d[m]+a[i][j]);}cout<<d[7];}`,
`a = [[9,2,7],[6,4,3],[5,8,1]]
d = [10**9]*8
d[0] = 0
for mask in range(7):
    i = mask.bit_count()
    for j in range(3):
        if not mask & (1<<j):
            nxt = mask | (1<<j)
            d[nxt] = min(d[nxt],d[mask]+a[i][j])
print(d[-1])`,'9',
['n 位掩码最多表示多少个集合？',['n','n²','2^n','n!'],2,'每一位有选或不选两种情况。'],['下一位工人索引如何确定？',['mask本身','mask置位数','最低零位','任务总数'],1,'每完成一个任务就恰好分配一个工人。'],'用状态压缩求三人三任务最低总成本 9，每项任务恰分配一次。');
add('algo-digit-dp','algo','数位 DP：带上界的整数计数','动态规划',
[['按高位逐步构造','当要求统计 0 到 N 中满足数字性质的整数时，可以从最高位向最低位选择数字，而不是枚举每个整数。状态包括当前位置和所需性质。'],['tight 记录上界限制','若此前选出的前缀与 N 相同，本位不能超过 N 的对应数字；前缀更小后，本位可取 0 到 9。前导零对“不包含数字4”无影响，但统计数字0出现次数时必须另设 started。'],['禁止数字4的例子','本例统计 0 到 25 中十进制表示不含 4 的整数。排除 4、14、24，保留 23 个；0 也算一个合法整数。']],
'区间 [L,R] 通常用 f(R)−f(L−1)，负上界应返回0；不要忘记是否包含整数0。','固定禁用数字时 O(位数×10) 时间，O(位数) 记忆化空间。',
String.raw`long long countOK(int n){if(n<0)return 0;string s=to_string(n);vector<long long>memo(s.size(),-1);function<long long(int,bool)>f=[&](int p,bool tight)->long long{if(p==(int)s.size())return 1;if(!tight&&memo[p]!=-1)return memo[p];int limit=tight?s[p]-'0':9;long long ans=0;for(int d=0;d<=limit;d++)if(d!=4)ans+=f(p+1,tight&&d==limit);if(!tight)memo[p]=ans;return ans;};return f(0,true);}int main(){cout<<countOK(25);}`,
`from functools import lru_cache
def count_ok(n):
    if n < 0: return 0
    s = str(n)
    @lru_cache(None)
    def f(p,tight):
        if p == len(s): return 1
        limit = int(s[p]) if tight else 9
        return sum(f(p+1,tight and d == limit) for d in range(limit+1) if d != 4)
    return f(0,True)
print(count_ok(25))`,'23',
['tight 为真表示什么？',['已超过上界','前缀仍等于上界前缀','一定含4','全为前导零'],1,'前缀相同才需要受当前位上界限制。'],['0到25不含4的整数有几个？',['22','23','24','25'],1,'26个整数中排除4、14、24三个。'],'实现数位 DP 统计不含数字4的整数，包含0，count_ok(25)输出23。');
add('algo-kmp','algo','KMP、前缀函数与 Z 算法','字符串算法',
[['失配后保留已知信息','朴素匹配遇到失配会反复比较；KMP 用模式串前缀函数记录每个前缀的最长相等真前后缀长度，从而快速跳到仍可能匹配的位置。'],['前缀函数递推','从 j=pi[i−1] 开始，失配时 j=pi[j−1]，直到找到可扩展前缀或退到0。成功相等再加一。总回退次数受总增长次数限制，所以是线性时间。'],['与 Z 数组对照','Z[i] 表示从 i 开始与整个字符串前缀相同的最长长度，适合前缀匹配、周期与拼接检索。本例专注 KMP，ABABABA 中 ABA 的起点是0、2、4，允许重叠。']],
'找到一次匹配后回退到 pi[m−1]，而非直接清零，否则会漏掉重叠匹配。本例模式非空。','O(n+m) 时间，O(m) 额外空间。',
String.raw`int main(){string s="ABABABA",p="ABA";vector<int>pi(p.size());for(int i=1,j=0;i<(int)p.size();i++){while(j&&p[i]!=p[j])j=pi[j-1];if(p[i]==p[j])j++;pi[i]=j;}for(int i=0,j=0;i<(int)s.size();i++){while(j&&s[i]!=p[j])j=pi[j-1];if(s[i]==p[j])j++;if(j==(int)p.size()){cout<<i-j+1<<' ';j=pi[j-1];}}}`,
`s,p = 'ABABABA','ABA'
pi = [0]*len(p)
j = 0
for i in range(1,len(p)):
    while j and p[i] != p[j]: j = pi[j-1]
    if p[i] == p[j]: j += 1
    pi[i] = j
j,out = 0,[]
for i,ch in enumerate(s):
    while j and ch != p[j]: j = pi[j-1]
    if ch == p[j]: j += 1
    if j == len(p):
        out.append(i-j+1)
        j = pi[j-1]
print(*out)`,'0 2 4',
['前缀函数保存什么？',['字符总数','最长相等真前后缀长度','ASCII总和','最长回文'],1,'真前缀不能等于整个当前前缀本身。'],['ABABABA中ABA出现次数？',['1','2','3','4'],2,'起点0、2、4，包含重叠匹配。'],'实现前缀函数和 KMP 搜索，输出三个匹配起点 0 2 4。');
add('algo-rolling-hash','algo','滚动哈希与候选验证','字符串算法',
[['把片段映射到数值','多项式哈希按字符编码累积 H=H·base+code，再对模数取余。前缀哈希和幂数组可在常数时间计算任意子串哈希。'],['碰撞不等于相等','不同字符串可能有相同哈希。双模数只能降低风险，不能成为严格无碰撞证明；要求确定正确时，应在哈希命中后比较原始字符串。'],['本例 Rabin–Karp','在 banana 中查找 ana，先比较两段的哈希，再逐字符核验，得到起点1和3。示例保留验证步骤，展示性能与正确性之间的区别。']],
'减法取模可能为负，C++ 需要加模数归一化；无符号溢出哈希也存在碰撞。','预处理 O(n+m)，每个哈希 O(1)；全部候选验证最坏 O(nm)。',
String.raw`int main(){string s="banana",p="ana";const long long M=1000000007,B=131;vector<long long>h(s.size()+1),pw(s.size()+1,1);for(size_t i=0;i<s.size();i++){h[i+1]=(h[i]*B+(unsigned char)s[i])%M;pw[i+1]=pw[i]*B%M;}long long target=0;for(unsigned char c:p)target=(target*B+c)%M;for(size_t i=0;i+p.size()<=s.size();i++){long long x=(h[i+p.size()]-h[i]*pw[p.size()]%M+M)%M;if(x==target&&s.compare(i,p.size(),p)==0)cout<<i<<' ';}}`,
`s,p = 'banana','ana'
M,B = 1000000007,131
h,pw = [0],[1]
for ch in s:
    h.append((h[-1]*B+ord(ch))%M)
    pw.append(pw[-1]*B%M)
target = 0
for ch in p: target = (target*B+ord(ch))%M
out = []
for i in range(len(s)-len(p)+1):
    value = (h[i+len(p)]-h[i]*pw[len(p)])%M
    if value == target and s[i:i+len(p)] == p: out.append(i)
print(*out)`,'1 3',
['哈希相同必然字符串相同吗？',['必然','不必然','仅Python必然','仅C++必然'],1,'哈希是有限值映射，可能碰撞。'],['命中后比较原文的作用？',['确保匹配正确','使哈希无碰撞','减少字符串长度','保证线性最坏时间'],0,'核验可排除哈希碰撞，但增加最坏成本。'],'用前缀哈希查找 banana 中 ana，核验原文后输出 1 3。');
add('algo-number-theory','algo','数论：GCD、快速幂与素数筛','数学与进阶专题',
[['整除关系与欧几里得','gcd(a,b)=gcd(b,a mod b)，反复取余直到第二项为0。扩展欧几里得还能求 ax+by=gcd(a,b) 的整数系数，用于模逆元等问题。'],['二进制拆分指数','模快速幂每轮按指数最低位决定是否乘入底数，再将底数平方、指数右移。只需 O(log e) 次乘法。模逆元存在的条件是数与模数互素，不能随便用除法代替。'],['筛法的不同目标','埃氏筛批量标记合数，常从 p² 开始；线性筛为每个合数安排唯一最小质因子。本例计算 gcd(84,30)=6 与 3^13 mod 100=23。']],
'C++ 乘法可能在取模前溢出；本例模数小，通用大整数模乘需要更宽类型或安全乘法。','GCD O(log min(a,b))，快速幂 O(log e) 时间；示例额外空间 O(1)。',
String.raw`long long power(long long a,long long e,long long m){long long r=1%m;while(e){if(e&1)r=r*a%m;a=a*a%m;e>>=1;}return r;}int main(){cout<<gcd(84,30)<<' '<<power(3,13,100);}`,
`from math import gcd
def power(a,e,m):
    result = 1%m
    while e:
        if e&1: result = result*a%m
        a = a*a%m
        e >>= 1
    return result
print(gcd(84,30),power(3,13,100))`,'6 23',
['模逆元存在通常需要？',['数与模数互素','模数为偶数','指数为零','底数大于模数'],0,'ax≡1(mod m) 有解当且仅当 gcd(a,m)=1。'],['快速幂每轮怎样缩小指数？',['减1','除以2取整','增加1','不变'],1,'按二进制位处理，因此轮数对数级。'],'实现欧几里得与模快速幂，输出 6 23，并说明乘法溢出边界。');
add('algo-geometry','algo','计算几何：叉积、方向与线段相交','数学与进阶专题',
[['方向由叉积判断','二维向量 a×b=ax·by−ay·bx。对点 A、B、C，(B−A)×(C−A) 的正负表示逆时针、顺时针，零表示共线，是凸包、面积、相交判定的基础。'],['相交包含退化情况','严格跨立检查两端位于另一线段两侧；共线时还要检查点是否在端点包围盒内。只比较叉积符号会漏掉端点相接和重叠。'],['从基础到凸包','单调链凸包先排序再维护转向一致的链。本例聚焦闭线段相交，两个对角线 (0,0)-(2,2)、(0,2)-(2,0) 返回真。']],
'整数坐标叉积需考虑溢出；浮点几何需结合输入尺度选择误差策略。本例坐标绝对值很小。','单次线段相交 O(1) 时间与空间。',
String.raw`struct P{long long x,y;};long long cross(P a,P b,P c){return (b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);}bool on(P a,P b,P p){return cross(a,b,p)==0&&min(a.x,b.x)<=p.x&&p.x<=max(a.x,b.x)&&min(a.y,b.y)<=p.y&&p.y<=max(a.y,b.y);}bool intersect(P a,P b,P c,P d){auto x=cross(a,b,c),y=cross(a,b,d),z=cross(c,d,a),w=cross(c,d,b);if(on(a,b,c)||on(a,b,d)||on(c,d,a)||on(c,d,b))return true;return ((x>0)!=(y>0))&&((z>0)!=(w>0));}int main(){cout<<intersect({0,0},{2,2},{0,2},{2,0});}`,
`def cross(a,b,c):
    return (b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0])
def on(a,b,p):
    return cross(a,b,p)==0 and min(a[0],b[0])<=p[0]<=max(a[0],b[0]) and min(a[1],b[1])<=p[1]<=max(a[1],b[1])
def intersect(a,b,c,d):
    if on(a,b,c) or on(a,b,d) or on(c,d,a) or on(c,d,b): return True
    x,y,z,w = cross(a,b,c),cross(a,b,d),cross(c,d,a),cross(c,d,b)
    return (x>0)!=(y>0) and (z>0)!=(w>0)
print(int(intersect((0,0),(2,2),(0,2),(2,0))))`,'1',
['叉积为0通常说明三点？',['共线','两两相同','构成直角','距离相同'],0,'方向向量线性相关，三点共线。'],['检查共线点在线段上还需？',['包围盒范围','素数测试','图连通性','哈希值'],0,'共线不保证点位于两个端点之间。'],'实现包含端点接触和共线重叠的闭线段相交判断，示例输出1。',ADV);
add('algo-randomized','algo','随机化算法与蓄水池采样','数学与进阶专题',
[['概率保证需要模型','Las Vegas 算法总是正确而耗时随机；Monte Carlo 算法通常有固定资源界但允许小概率错误。随机快速排序的期望界依赖随机选择，而非最坏界消失。'],['流式均匀抽一个','蓄水池采样读到第 i 项时以 1/i 的概率替换当前样本。假设每轮使用独立均匀随机源，归纳可证每个已读元素被保留的概率均为 1/i，不必预先知道流长度。'],['可重复演示','示例使用固定种子的线性同余生成器与拒绝采样，在均匀32位随机源假设下消除直接取余的偏差；固定LCG并不证明统计独立。它只是可复现的教学伪随机源，不适合密码学；C++ 和 Python 对相同输入产生同样输出。']],
'均匀采样的概率证明假设每轮独立均匀的随机源；固定种子 LCG 仅用于演示，并不满足这种独立性证明。固定种子用于调试而非证明随机性；安全随机数不能用线性同余发生器。','流长 n 时期望 O(n) 时间，O(1) 存储；拒绝采样每轮期望常数次。',
String.raw`int main(){uint32_t state=1;auto next=[&](){state=state*1664525u+1013904223u;return state;};auto below=[&](uint32_t n){uint64_t limit=(uint64_t(1)<<32)/n*n;uint32_t x;do{x=next();}while(uint64_t(x)>=limit);return x%n;};int sample=0;for(uint32_t i=1;i<=5;i++)if(below(i)==0)sample=int(i)*10;cout<<sample;}`,
`state = 1
def below(n):
    global state
    limit = (2**32//n)*n
    while True:
        state = (state*1664525+1013904223) & 0xffffffff
        if state < limit: return state % n
sample = 0
for i in range(1,6):
    if below(i) == 0: sample = i*10
print(sample)`,'10',
['读到第i个元素时替换概率？',['1/i','1/2','i/n','永不替换'],0,'此概率使每个已读元素都等概率成为样本。'],['固定种子伪随机源可用于密码密钥吗？',['可以','不可以','只要输出很长就可以','仅C++可以'],1,'可预测的生成器不满足密码学要求。'],'实现单元素蓄水池采样与给定32位发生器，使两种语言可复现；解释为什么最终每项理论概率为1/n。',ADV);
add('algo-np-approx','algo','P、NP、归约与近似算法','数学与进阶专题',
[['区分求解与验证','P 是可在多项式时间判定的问题类，NP 是“是”实例存在可在多项式时间验证的证书的问题类。NP 不表示非多项式；是否 P=NP 仍未解决。'],['归约方向很重要','要证明新问题至少与已知难问题一样难，应把已知难问题归约到新问题。NP 完全还需说明新问题属于 NP；NP 难问题不要求一定在 NP 内。'],['顶点覆盖的2近似','任取一条尚未覆盖的边，将两个端点都加入解，再忽略所有被覆盖边。所选边构成匹配，每条至少需要最优解中的一个端点，因此结果不超过最优值两倍。']],
'近似比是对所有合法输入的理论保证，不等同于随机测试的平均效果。示例针对无权无向顶点覆盖。','按边扫描并记录端点 O(V+E) 时间，O(V) 空间。',
String.raw`int main(){vector<pair<int,int>>es{{0,1},{1,2},{2,3}};set<int>cover;for(auto [u,v]:es)if(!cover.count(u)&&!cover.count(v)){cover.insert(u);cover.insert(v);}for(int v:cover)cout<<v<<' ';}`,
`edges = [(0,1),(1,2),(2,3)]
cover = set()
for u,v in edges:
    if u not in cover and v not in cover: cover.update((u,v))
print(*sorted(cover))`,'0 1 2 3',
['NP 的含义是？',['非多项式','有多项式时间可验证证书','必然无法求解','只能随机求解'],1,'NP 关注证书的验证复杂度。'],['该顶点覆盖算法解大小保证？',['等于最优','不超过最优两倍','不超过最优平方','没有保证'],1,'选中匹配边端点，最优解至少覆盖每条匹配边。'],'实现无权顶点覆盖2近似，输出给定路径图的集合0 1 2 3，并解释该例最优只需2个点。',ADV);
add('net-delay','net','时延、带宽、吞吐量与 BDP','网络基础与链路层',
[['四类时延分开算','总时延由处理、排队、发送、传播组成。发送时延 L/R 取决于比特数与链路速率；传播时延 d/v 取决于距离和信号传播速度。带宽高不会消除传播时间。'],['流水线与瓶颈','多跳存储转发中，一个完整分组要先发送完才可转发；持续传输时吞吐量主要受最慢链路限制。排队取决于负载，不能简单视为常数。'],['窗口与带宽时延积','BDP=带宽×RTT 给出填满往返管道所需的在途数据量。1000字节分组在10Mbit/s链路发送需0.8毫秒，传播需5毫秒时单跳合计5.8毫秒。本例不含处理排队。']],
'字节与比特差8倍，毫秒与秒差1000倍；标明使用十进制 Mbit/s。','固定公式计算 O(1) 时间和空间。',
String.raw`int main(){double bytes=1000,rate=10000000,propMs=5;cout<<fixed<<setprecision(1)<<(bytes*8/rate*1000+propMs);}`,
`size,rate,prop_ms = 1000,10000000,5
print(f'{size*8/rate*1000+prop_ms:.1f}')`,'5.8',
['发送时延的公式是？',['L/R','d/v','R/L','RTT/8'],0,'L是比特长度，R是每秒发送比特数。'],['提高带宽能消除传播时延吗？',['能','不能','只对TCP能','只对UDP能'],1,'传播由距离与传播速度决定。'],'计算1000字节经10Mbit/s链路、传播5毫秒的单跳总时延，忽略排队处理，输出5.8毫秒。');
add('net-crc','net','差错检测：奇偶校验、校验和与 CRC','网络基础与链路层',
[['检测不等于纠错','奇偶位检测奇数个翻转；互联网校验和使用反码加法；CRC 将比特串看成GF(2)上的多项式，执行异或长除法。它们用于检错，不保证任何错误都可发现。'],['生成多项式决定余数','发送端在数据后补 r 个零，除以 r 次生成多项式，余数填到末尾；接收端再除，若余数非零则说明检测到错误。运算中没有进位借位。'],['手算到代码','数据1101、生成式1011，补零后除法余数001，发送码字1101001。本例只生成CRC，不模拟真实以太网CRC32的初值和反射规则。']],
'余数为零只说明未检测到错误；CRC不是防恶意篡改的密码学认证码。','朴素长除法 O(nr) 时间，O(n+r) 空间。',
String.raw`int main(){string data="1101",g="1011",w=data+string(g.size()-1,'0');for(size_t i=0;i<data.size();i++)if(w[i]=='1')for(size_t j=0;j<g.size();j++)w[i+j]=w[i+j]==g[j]?'0':'1';cout<<data+w.substr(data.size());}`,
`data,g = '1101','1011'
w = list(data+'0'*(len(g)-1))
for i in range(len(data)):
    if w[i] == '1':
        for j,b in enumerate(g): w[i+j] = '0' if w[i+j] == b else '1'
print(data+''.join(w[len(data):]))`,'1101001',
['CRC除法中的减法对应？',['异或','普通十进制减法','乘法','取最大值'],0,'GF(2)中加减都是异或。'],['CRC通过就能保证没有恶意修改吗？',['能','不能','只对文本能','只对短包能'],1,'CRC非密码学认证，攻击者可重新计算。'],'用生成多项式1011给数据1101生成CRC码字，输出1101001。');
add('net-switch-vlan','net','以太网交换、MAC 学习与 VLAN','网络基础与链路层',
[['源地址学习','交换机记录帧的源MAC来自哪个端口，再根据目的MAC查表转发。目的未知时向同VLAN其他端口泛洪；目的就在入端口时应过滤，避免发回。'],['VLAN划分广播域','同一物理交换机可划分多个逻辑广播域，学习表的键通常包含VLAN。跨VLAN通信需三层转发，trunk可承载多个带标签VLAN。'],['本例学习表','A从端口1发给未知B，发生泛洪；B从端口2回应A后学到B并转发到1；随后A发给B可直接转发到2。本例固定一个VLAN，不实现真实帧格式。']],
'不能根据目的地址学习来源端口；实际交换机还有表项老化、容量和环路处理。','哈希查表平均 O(1)，存储 O(M) 个MAC表项。',
String.raw`int main(){map<string,int>t;auto frame=[&](string src,string dst,int in){t[src]=in;auto it=t.find(dst);if(it==t.end())cout<<"FLOOD";else if(it->second==in)cout<<"FILTER";else cout<<it->second;cout<<'\n';};frame("A","B",1);frame("B","A",2);frame("A","B",1);}`,
`table = {}
def frame(src,dst,port):
    table[src] = port
    print('FLOOD' if dst not in table else 'FILTER' if table[dst] == port else table[dst])
frame('A','B',1)
frame('B','A',2)
frame('A','B',1)`,'FLOOD\n1\n2',
['交换机通过哪个地址学习端口？',['源MAC','目的MAC','目的IP','DNS名'],0,'源地址告诉交换机该主机位于哪侧。'],['未知目的MAC通常如何处理？',['同VLAN其他端口泛洪','全部丢弃','发给所有互联网主机','修改目的MAC'],0,'未知单播泛洪范围受VLAN限制。'],'模拟三帧的MAC学习过程，依次输出FLOOD、1、2，包含同端口过滤规则。');
add('net-stp','net','二层环路与生成树协议','网络基础与链路层',
[['为什么广播会循环','以太网帧没有IP那样逐跳减小的TTL。交换机形成物理环路时，泛洪帧可能不断循环，造成广播风暴和MAC表项抖动。'],['保留冗余但阻断环路','STP选出根桥，选择到根的最低路径成本，并将部分端口置于非转发状态，保留逻辑树。拓扑变化时重新收敛；RSTP改进收敛行为。'],['根桥选择小模型','根桥按桥ID排序，优先级更小者优先，同优先级比较MAC。示例三个桥，优先级4096的桥胜出。这里只模拟选根，不模拟BPDU、端口角色和计时器。']],
'STP是分布式协议，不等同于简单运行一次最小生成树算法；链路成本与桥ID分别参与不同决策。','示例选根 O(n) 时间，O(n) 输入存储。',
String.raw`int main(){vector<pair<int,string>>bridges{{32768,"00:00:00:00:00:01"},{4096,"00:00:00:00:00:09"},{32768,"00:00:00:00:00:02"}};auto b=*min_element(bridges.begin(),bridges.end());cout<<b.first<<' '<<b.second;}`,
`bridges = [(32768,'00:00:00:00:00:01'),(4096,'00:00:00:00:00:09'),(32768,'00:00:00:00:00:02')]
priority,mac = min(bridges)
print(priority,mac)`,'4096 00:00:00:00:00:09',
['STP主要解决什么？',['二层环路','TCP重传','DNS缓存','HTTP压缩'],0,'逻辑无环拓扑避免泛洪循环。'],['根桥优先选择哪个桥ID？',['最小','最大','随机','流量最多'],0,'优先级及MAC构成的桥ID越小越优先。'],'按优先级和MAC选择示例根桥，输出4096及其MAC；明确这只是选根模型。');
add('net-arp','net','ARP、下一跳与邻居缓存','网络层与路由',
[['解析本链路地址','IPv4主机已知下一跳IP，但以太网发送需要MAC。ARP请求通常广播，目标主机回复自己的MAC；结果存入邻居缓存，并有超时与更新机制。'],['远端目的先找网关','目的在本地子网时解析目的主机；否则解析默认网关，而非直接查询远端服务器MAC。IP目的地址仍然是远端服务器，链路层目的地址是下一跳。'],['下一跳选择模型','本机192.168.1.10/24，网关192.168.1.1，目的8.8.8.8，因此选择网关作为ARP目标。示例只做子网掩码判断，不发ARP报文。']],
'ARP本身不认证映射，缓存可能被伪造；IPv6使用邻居发现机制，不使用ARP。','IPv4整数掩码判断 O(1) 时间与空间。',
String.raw`uint32_t ip(int a,int b,int c,int d){return (uint32_t(a)<<24)|(uint32_t(b)<<16)|(uint32_t(c)<<8)|uint32_t(d);}int main(){auto self=ip(192,168,1,10),dst=ip(8,8,8,8),mask=ip(255,255,255,0);cout<<((self&mask)==(dst&mask)?"8.8.8.8":"192.168.1.1");}`,
`from ipaddress import IPv4Address,IPv4Network
network = IPv4Network('192.168.1.10/24',strict=False)
dst = IPv4Address('8.8.8.8')
print(dst if dst in network else '192.168.1.1')`,'192.168.1.1',
['访问外网时通常ARP查询谁？',['默认网关','远端服务器','DNS根服务器','所有路由器'],0,'ARP用于当前链路的下一跳地址解析。'],['IPv6是否使用ARP？',['使用','不使用，采用邻居发现','仅无线用','仅TCP用'],1,'IPv6用基于ICMPv6的邻居发现。'],'根据192.168.1.10/24判断8.8.8.8的下一跳，输出默认网关192.168.1.1。','https://www.rfc-editor.org/rfc/rfc826');
add('net-dhcp','net','DHCP：动态配置与租约','网络层与路由',
[['从发现到确认','DHCPv4常见首次获取流程是Discover、Offer、Request、ACK。客户端广播发现服务器，服务器提供地址，客户端选择一个提供并请求，最终确认租约。'],['租约不是永久所有权','租约包含有效期，客户端通常先在T1尝试续租，T2开始重绑定；未获得有效租约时不能无限期继续使用。地址池、保留地址和冲突检查共同影响分配。'],['教学状态机','输入四种消息按顺序推进 INIT→SELECTING→REQUESTING→BOUND。本例只接受简化DORA路径，不实现多服务器、NAK、重传和实际UDP收发。']],
'DHCP分配IP不等同于DNS解析名字；常一起下发网关和DNS配置，但职责不同。','对m条事件 O(m) 时间，状态存储 O(1)。',
String.raw`int main(){string state="INIT";vector<string>events{"DISCOVER","OFFER","REQUEST","ACK"};map<pair<string,string>,string>next{{{"INIT","DISCOVER"},"SELECTING"},{{"SELECTING","OFFER"},"OFFERED"},{{"OFFERED","REQUEST"},"REQUESTING"},{{"REQUESTING","ACK"},"BOUND"}};for(auto e:events){auto it=next.find({state,e});if(it==next.end()){cout<<"INVALID";return 0;}state=it->second;}cout<<state;}`,
`transitions = {('INIT','DISCOVER'):'SELECTING',('SELECTING','OFFER'):'OFFERED',('OFFERED','REQUEST'):'REQUESTING',('REQUESTING','ACK'):'BOUND'}
state = 'INIT'
for event in ['DISCOVER','OFFER','REQUEST','ACK']:
    state = transitions.get((state,event),'INVALID')
    if state == 'INVALID': break
print(state)`,'BOUND',
['DORA最后一项是什么？',['ACK','ARP','SYN','FIN'],0,'服务器ACK确认租约。'],['租约过期且续租失败能无限使用吗？',['能','不能','只有TCP能','只在夜间能'],1,'租约限定地址使用的有效时间。'],'实现简化DORA状态机，合法序列输出BOUND，不合法事件输出INVALID。','https://www.rfc-editor.org/rfc/rfc2131');
add('net-icmp','net','ICMP、TTL 与路径诊断','网络层与路由',
[['控制消息辅助IP','ICMP传递不可达、超时等控制信息，ping常使用Echo请求与响应。ICMP并不使IP变可靠，也不是TCP或UDP的上层应用。'],['TTL限制转发次数','IPv4 TTL在每次转发时减小，减到零时路由器丢弃并可能返回Time Exceeded。traceroute发送递增TTL的探测包，从响应中推测沿途路由器。'],['路径只是观测','本例三跳路径A、B、C，分别模拟TTL=1、2、3的过期位置。实际网络可能过滤ICMP、使用不同回程或负载均衡，测量不一定展示完整真实路径。']],
'某跳不回复不等于该跳不转发业务流量；ping失败也不能单独证明目标服务不可用。','每次模拟 O(hops)，示例固定3次探测。',
String.raw`int main(){vector<string>path{"A","B","C"};for(int ttl=1;ttl<=3;ttl++){int remaining=ttl;for(auto hop:path)if(--remaining==0){cout<<hop<<' ';break;}}}`,
`path = ['A','B','C']
answers = []
for ttl in range(1,4):
    remaining = ttl
    for hop in path:
        remaining -= 1
        if remaining == 0:
            answers.append(hop)
            break
print(*answers)`,'A B C',
['TTL逐跳减少主要防止？',['路由循环无限持续','文件损坏','DNS重名','证书过期'],0,'跳数预算最终耗尽，包不会永久循环。'],['中间路由器不回ICMP能证明不转发吗？',['能','不能','只对IPv4能','只对UDP能'],1,'路由器可以转发流量但限制诊断响应。'],'模拟三个递增TTL探测，给出A B C三个超时位置，说明实际观测的限制。','https://www.rfc-editor.org/rfc/rfc792');
add('net-ipv6','net','IPv6 地址、扩展首部与邻居发现','网络层与路由',
[['128位与文本压缩','IPv6地址包含8组16位十六进制数，可以省略组内前导零；连续零组可用一次双冒号压缩。前缀长度仍使用CIDR记法，不能简单按冒号数量判断网络。'],['基本首部与分片','IPv6基本首部固定40字节，扩展信息通过扩展首部承载。路由器不会像IPv4那样进行中途分片，发送端应结合路径MTU发现调整包大小。'],['地址范围辨认','IPv6没有广播，使用组播等机制；邻居发现通过ICMPv6完成。示例根据16位首组判断fe80::/10链路本地地址，fe80匹配、2001不匹配。']],
'链路本地地址仅在所属链路有效，实际使用常需接口作用域；不要把IPv6当成只是更长的IPv4字符串。','前缀位运算 O(1) 时间与空间。',
String.raw`int main(){vector<unsigned>first{0xfe80,0x2001};for(auto x:first)cout<<((x&0xffc0)==0xfe80?"LINK_LOCAL":"OTHER")<<'\n';}`,
`for first in [0xfe80,0x2001]:
    print('LINK_LOCAL' if first & 0xffc0 == 0xfe80 else 'OTHER')`,'LINK_LOCAL\nOTHER',
['IPv6地址有多少位？',['32','64','128','256'],2,'IPv6使用128位地址。'],['IPv6中途路由器通常如何处理超MTU包？',['直接分片','报告过大而不分片','改成IPv4','复制发送'],1,'分片由源端处理，路由器可发送Packet Too Big。'],'用/10位掩码检测首组fe80、2001是否链路本地，输出LINK_LOCAL和OTHER。','https://www.rfc-editor.org/rfc/rfc8200');

add('net-cidr','net','CIDR、VLSM 与最长前缀匹配','网络层与路由',
[['前缀表示地址块','CIDR用地址与前缀长度表示连续地址范围，VLSM允许不同子网采用不同掩码。分配时要满足块大小与对齐要求，不能把任意连续范围都写成单个前缀。'],['更具体的路由优先','一个目的地址可同时匹配多条路由，转发时优先选择前缀最长者。默认路由/0覆盖所有地址，但比任何更具体的匹配路由优先级低。'],['线性表教学实现','目的10.1.2.3同时命中/0、10.0.0.0/8和10.1.0.0/16，因此选出/16对应出口C。真实设备常用专门数据结构提高检索速度。']],
'/0掩码要单独处理；C++将32位值左移32位不合法。地址比较前应先掩码归一。','线性路由表 O(R) 查询，O(R) 空间；Trie可按地址位数查询。',
String.raw`int main(){struct Route{uint32_t net;int prefix;string hop;};vector<Route>rs{{0,0,"A"},{0x0a000000,8,"B"},{0x0a010000,16,"C"}};uint32_t dst=0x0a010203;int best=-1;string answer;for(auto r:rs){uint32_t mask=r.prefix?0xffffffffu<<(32-r.prefix):0;if((dst&mask)==(r.net&mask)&&r.prefix>best){best=r.prefix;answer=r.hop;}}cout<<answer;}`,
`from ipaddress import IPv4Network,IPv4Address
routes = [('0.0.0.0/0','A'),('10.0.0.0/8','B'),('10.1.0.0/16','C')]
dst = IPv4Address('10.1.2.3')
matches = [(IPv4Network(prefix).prefixlen,hop) for prefix,hop in routes if dst in IPv4Network(prefix)]
print(max(matches)[1])`,'C',
['同时匹配多个前缀时优先哪个？',['最长前缀','最短前缀','最先添加','数字最大'],0,'更长前缀表示更具体的目的范围。'],['默认路由前缀长度是？',['0','8','24','32'],0,'/0无地址位约束，覆盖全部目的地址。'],'为10.1.2.3执行最长前缀匹配，选择10.1.0.0/16对应出口C。','https://www.rfc-editor.org/rfc/rfc4632');
add('net-nat','net','NAT、端口映射与连接跟踪','网络层与路由',
[['复用公网地址','传统NAPT改写内部源IP和源端口，用一个公网地址上的不同端口代表多条内部会话；返回流量依据映射恢复内部目的。IP及传输校验和也需相应更新。'],['状态影响连通性','映射通常有超时，入站连接若没有现成映射或明确转发规则，不能直接定位内部主机。不同NAT映射过滤行为会影响打洞与端到端协议。'],['映射表示例','两台内网主机都使用源端口5000，分别分配公网端口40000和40001。本例按内部地址端口创建映射，再把返回端口40001还原为10.0.0.3:5000。']],
'这个模型只演示地址端口映射；真实连接跟踪还要考虑协议、远端端点、状态和超时，NAT也不等同于防火墙。','映射字典平均 O(1) 查找，存储 O(C) 条活动映射。',
String.raw`int main(){map<string,int>out;map<int,string>in;int port=40000;for(string key:{"10.0.0.2:5000","10.0.0.3:5000"}){out[key]=port;in[port]=key;port++;}cout<<in.at(40001);}`,
`forward,reverse = {},{}
port = 40000
for endpoint in ['10.0.0.2:5000','10.0.0.3:5000']:
    forward[endpoint] = port
    reverse[port] = endpoint
    port += 1
print(reverse[40001])`,'10.0.0.3:5000',
['NAPT常用什么区分共享公网IP的连接？',['端口映射','文件名','DNS大小写','MAC厂商'],0,'公网端口与内部端点建立对应关系。'],['NAT与防火墙是否完全等价？',['是','否','只在IPv4等价','只在TCP等价'],1,'地址转换与访问控制是不同功能。'],'建立两个内部端点的公网端口映射，将40001还原为10.0.0.3:5000。','https://www.rfc-editor.org/rfc/rfc3022');
add('net-rip','net','距离向量路由：Bellman–Ford 与 RIP','网络层与路由',
[['向邻居学习距离','路由器向邻居通告目的网络的距离，再计算经过每个邻居的候选成本，选择最小值。这是分布式Bellman–Ford思想，不需要一开始掌握全网拓扑。'],['坏消息传播可能慢','链路失效后邻居可能互相引用过期路由，产生计数到无穷。水平分割、毒性逆转与触发更新缓解部分问题，但不能视作万能即时收敛。'],['RIP的度量上界','RIP以跳数为主要度量，16表示不可达，最大可用距离15。示例从当前不可达开始，经邻居距离4加本地一跳得到5，并把16限制为不可达。']],
'这是单轮距离计算，不是完整RIP实现；真实协议还有路由超时、更新报文与选路规则。','一轮对k个邻居 O(k) 时间，示例额外空间 O(1)。',
String.raw`int main(){vector<int>advertised{4,16,9};int distance=16;for(int x:advertised)distance=min(distance,min(16,x+1));cout<<distance;}`,
`advertised = [4,16,9]
distance = min([16]+[min(16,x+1) for x in advertised])
print(distance)`,'5',
['RIP中16跳表示？',['可达且很快','不可达','默认网关','本地网络'],1,'RIP的无穷度量为16。'],['邻居到目标4跳，经一条本地链路得到？',['3','4','5','16'],2,'候选距离为1+4=5。'],'根据邻居通告4、16、9计算本路由器距离，候选度量上限16，输出5。','https://www.rfc-editor.org/rfc/rfc2453');
add('net-ospf','net','链路状态路由与 OSPF','网络层与路由',
[['传播的是拓扑信息','链路状态协议传播本路由器与相邻节点的链路信息，各路由器形成链路状态数据库，然后在本地计算最短路径树。与距离向量传播目的距离不同。'],['新旧消息不能混淆','LSA含序列号和老化信息，用于区分较新的拓扑通告并移除过期信息。洪泛需要可靠性与去重，不能收到任何旧包都覆盖当前数据库。'],['区域与计算范围','OSPF通过区域组织拓扑，常见骨干为Area0，区域内SPF计算和区域间路由有不同规则。示例只模拟按序列号接收LSA：序号10后忽略9，再接受11。']],
'真实OSPF还比较校验和与年龄等字段，并有邻居状态机；示例仅演示单个发起者的单调更新。','处理m条通告 O(m) 时间，单项数据库 O(1) 空间。',
String.raw`int main(){int seq=-1,cost=0;vector<pair<int,int>>messages{{10,5},{9,1},{11,7}};for(auto [s,c]:messages)if(s>seq){seq=s;cost=c;}cout<<seq<<' '<<cost;}`,
`seq,cost = -1,0
for incoming,value in [(10,5),(9,1),(11,7)]:
    if incoming > seq: seq,cost = incoming,value
print(seq,cost)`,'11 7',
['链路状态协议主要传播什么？',['邻接链路状态','应用密码','HTTP缓存','所有用户数据'],0,'路由器据此形成拓扑数据库。'],['已收到序号10后又收到9，简化模型应？',['接受9','忽略9','清空数据库','断开全部链路'],1,'旧通告不应覆盖新状态。'],'模拟同一LSA的10、9、11三次更新，最后输出序号11和成本7。','https://www.rfc-editor.org/rfc/rfc2328');
add('net-bgp','net','BGP：自治系统、路径向量与策略','网络层与路由',
[['跨自治系统交换可达性','BGP负责自治系统之间的路由信息交换，通告前缀及AS_PATH等属性。它不仅考虑路径长度，更重要的是运营策略、商业关系和本地偏好。'],['路径向量抑制环路','AS_PATH记录经过的自治系统；接收路由时若路径包含本AS，通常应拒绝以避免环路。BGP并不能自动保证所有通告真实，需要额外运营安全机制。'],['简化选路示例','先拒绝包含本AS65000的路径，再优先本地偏好高者，最后优先AS路径短者。两条有效路由中偏好200的B胜出，尽管其AS_PATH更长；不模拟完整厂商决策序列。']],
'不能把BGP理解成纯最短路径；MED等属性的比较范围及规则比此模型更细。','对R条路由与最长路径L，示例 O(RL) 过滤和 O(R log R) 排序。',
String.raw`int main(){struct R{string name;int pref;vector<int>path;};vector<R>all{{"A",100,{64501}},{"B",200,{64502,64503}},{"C",300,{65000,64504}}},ok;for(auto r:all)if(find(r.path.begin(),r.path.end(),65000)==r.path.end())ok.push_back(r);sort(ok.begin(),ok.end(),[](R a,R b){if(a.pref!=b.pref)return a.pref>b.pref;return a.path.size()<b.path.size();});cout<<ok.front().name;}`,
`routes = [('A',100,[64501]),('B',200,[64502,64503]),('C',300,[65000,64504])]
valid = [r for r in routes if 65000 not in r[2]]
valid.sort(key=lambda r:(-r[1],len(r[2])))
print(valid[0][0])`,'B',
['AS_PATH包含自己的AS通常意味着？',['潜在路由环路','一定最优','DNS成功','MTU过大'],0,'拒绝包含自身AS的路径可防止环路。'],['BGP是否总选AS跳数最少路由？',['是','否，会先考虑策略属性','仅IPv6如此','取决于端口'],1,'本地偏好等策略可优先于路径长度。'],'过滤环路并按本地偏好降序、路径长度升序选择示例路由，输出B。','https://www.rfc-editor.org/rfc/rfc4271');
add('net-udp','net','UDP、数据报边界与校验和','传输层与可靠通信',
[['保留消息边界','UDP提供无连接数据报，单个发送对应一个数据报。它不内置可靠重传、按序交付或拥塞控制；应用可在其上实现这些机制。'],['首部与校验和','UDP首部含源端口、目的端口、长度、校验和。互联网校验和对16位字做反码加法并折叠进位，真实UDP计算还包含IP伪首部、UDP首部和数据。'],['只演示运算核心','本例对三个16位字0x1234、0xabcd、0x0001计算反码和，结果0x41fd。它不是完整UDP报文校验器，因为未构造伪首部。']],
'校验和不能替代认证；UDP也不表示没有任何校验。IPv4和IPv6对零校验和的规定不同。','对n个16位字 O(n) 时间，O(1) 额外空间。',
String.raw`int main(){uint32_t sum=0;for(unsigned x:{0x1234u,0xabcdu,0x0001u}){sum+=x;sum=(sum&0xffff)+(sum>>16);}while(sum>>16)sum=(sum&0xffff)+(sum>>16);cout<<hex<<setw(4)<<setfill('0')<<((~sum)&0xffff);}`,
`total = 0
for word in [0x1234,0xabcd,0x0001]:
    total += word
    total = (total & 0xffff)+(total>>16)
while total>>16: total = (total & 0xffff)+(total>>16)
print(f'{(~total)&0xffff:04x}')`,'41fd',
['UDP是否保留数据报边界？',['是','否','仅HTTP中保留','仅空包保留'],0,'UDP提供面向数据报的服务。'],['本例运算能直接验证完整UDP包吗？',['能','不能，还缺伪首部等输入','只缺DNS','不需要首部'],1,'UDP校验和覆盖伪首部、UDP首部和数据。'],'实现16位反码校验和核心，给定三个字输出十六进制41fd。','https://www.rfc-editor.org/rfc/rfc768');
add('net-arq','net','ARQ、停等与滑动窗口','传输层与可靠通信',
[['确认与超时实现可靠性','发送方保留未确认数据，收到确认后释放，超时则重传。接收方需要序号识别重复数据；ACK也可能丢失，因此重传不能导致重复交付。'],['GBN与选择重传','Go-Back-N在缺口后丢弃乱序并回退重传；Selective Repeat缓存乱序数据并分别确认。滑动窗口允许多个包在途，提高高RTT链路利用率。'],['选择重传接收缓冲','示例按序收到编号0、2、1、1、3。接收端暂存2，收到1后一起交付1和2，重复1不再次交付，最终应用只收到0、1、2、3。']],
'序号空间有限时窗口大小需防止新旧包混淆；本例使用不回绕的整数序号和无限小样本缓冲。','用有序集合的m条到达处理 O(m log m)，空间 O(m)。',
String.raw`int main(){set<int>buffer;int expected=0;for(int seq:{0,2,1,1,3}){if(seq>=expected)buffer.insert(seq);while(buffer.count(expected)){cout<<expected<<' ';buffer.erase(expected++);}}}`,
`buffer,expected = set(),0
out = []
for seq in [0,2,1,1,3]:
    if seq >= expected: buffer.add(seq)
    while expected in buffer:
        out.append(expected)
        buffer.remove(expected)
        expected += 1
print(*out)`,'0 1 2 3',
['接收方序号主要用于？',['识别顺序与重复','加密','降低光速','改变IP'],0,'序号帮助重组及防止重复交付。'],['先收到0、2，再收到1应如何按序交付？',['先交付2再1','交付1后交付已缓存2','永远丢弃2','重发所有IP'],1,'选择重传可缓存乱序，缺口补齐后连续交付。'],'实现乱序缓冲与重复过滤，对0、2、1、1、3只交付0 1 2 3。');
add('net-rto','net','RTT 估计、RTO 与超时退避','传输层与可靠通信',
[['超时不能只取单次RTT','网络时延会波动，过短RTO导致无谓重传，过长则恢复慢。TCP用平滑RTT与RTT偏差共同估计超时，取样还要避免重传后的确认歧义。'],['按规定顺序更新','首次样本R令SRTT=R、RTTVAR=R/2。之后先用旧SRTT更新偏差：RTTVAR=(1−β)RTTVAR+β|SRTT−R|，再更新SRTT，常用α=1/8、β=1/4。'],['计时器边界','RTO=SRTT+max(G,4RTTVAR)，RFC6298规定其小于1秒时应向上取到1秒，超时还应指数退避。本例只算两次样本后的估计，不运行实际计时器。']],
'更新RTTVAR必须使用旧SRTT。实现还有初始RTO、上下界与Karn规则等细节。','每个样本 O(1) 时间与空间。',
String.raw`int main(){double srtt=100,var=50,r=140;var=.75*var+.25*abs(srtt-r);srtt=.875*srtt+.125*r;double rto=max(1000.0,srtt+max(1.0,4*var));cout<<fixed<<setprecision(1)<<srtt<<' '<<var<<' '<<rto;}`,
`srtt,var,r = 100.0,50.0,140.0
var = .75*var+.25*abs(srtt-r)
srtt = .875*srtt+.125*r
rto = max(1000.0,srtt+max(1.0,4*var))
print(f'{srtt:.1f} {var:.1f} {rto:.1f}')`,'105.0 47.5 1000.0',
['RTTVAR更新使用哪个SRTT？',['更新前的值','更新后的值','固定0','不使用'],0,'RFC规定先更新偏差再更新平滑值。'],['过短RTO的常见问题？',['无谓重传','永不丢包','保证更快','消除拥塞'],0,'还未到达的确认被误判超时会触发重传。'],'以首样本100ms和次样本140ms更新估计，输出SRTT105.0、RTTVAR47.5、RTO1000.0毫秒。','https://www.rfc-editor.org/rfc/rfc6298');

})();

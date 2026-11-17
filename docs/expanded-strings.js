/* 字符串索引与多模式匹配：原创示例。 */
(()=>{
function add(id,title,sub,concepts,pitfall,cost,cpp,python,output,q1,q2,task,url){
 lesson(id,'algo',title,sub,'字符串算法',30,concepts,pitfall,cost,cpp,python,output,q1,q2,task);
 Object.assign(LESSONS.at(-1),{sources:[['算法原始研究或大学讲义',url]],cppStandard:'C++17',outputTestable:true});
}
add('algo-aho-corasick','Aho–Corasick 多模式匹配','Trie · 失败指针 · 输出汇总',
 [['让多个模式共享前缀','当一段文本要同时查找很多关键词时，可以把所有模式插入 Trie。状态代表已经匹配的前缀；仅重复运行单模式匹配会反复扫描同一文本。'],['失败指针保存可复用后缀','失败指针指向当前字符串的最长真后缀，且这个后缀也是 Trie 中的前缀。按 BFS 建立失败指针，可以利用已经处理的较短状态补全转移。终止计数沿失败指针累加，允许同一位置结束多个匹配。'],['实践：计数重叠匹配','本例限定小写英文字母、非空模式，统计每个模式的所有出现次数之和。模式 a、ab、bab 在 ababa 中分别出现 3、2、1 次，共 6 次。输出计数而非完整位置列表，因此不为每个匹配额外分配空间。']],
 '失败指针不是简单返回根。模式可重叠，不能匹配后跳过整段文本；本例重复输入同一模式会按输入次数计数。',
 '设模式总长度为 M，文本长度为 n，字母表大小 σ=26。补全转移的构建成本 O(Mσ)，扫描 O(n)，空间 O(Mσ)；枚举全部匹配还需加上输出数量。',
 String.raw`#include <iostream>
#include <vector>
#include <array>
#include <queue>
#include <string>
#include <stdexcept>
using namespace std;
struct Node {array<int,26> go;int fail=0;long long out=0;Node(){go.fill(-1);}};
int letter(char c){if(c<'a'||c>'z')throw invalid_argument("lowercase only");return c-'a';}
long long matches(const vector<string>& patterns,const string& text){
 vector<Node> t(1);
 for(const auto& p:patterns){if(p.empty())throw invalid_argument("empty pattern");int v=0;
  for(char ch:p){int c=letter(ch);if(t[v].go[c]<0){t[v].go[c]=(int)t.size();t.emplace_back();}v=t[v].go[c];}++t[v].out;}
 queue<int> q;
 for(int c=0;c<26;++c){int u=t[0].go[c];if(u<0)t[0].go[c]=0;else q.push(u);}
 while(!q.empty()){int v=q.front();q.pop();t[v].out+=t[t[v].fail].out;
  for(int c=0;c<26;++c){int u=t[v].go[c];if(u<0)t[v].go[c]=t[t[v].fail].go[c];else{t[u].fail=t[t[v].fail].go[c];q.push(u);}}}
 long long total=0;int v=0;for(char ch:text){v=t[v].go[letter(ch)];total+=t[v].out;}return total;
}
int main(){cout<<matches({"a","ab","bab"},"ababa");}`,
 `from collections import deque
def matches(patterns, text):
    go, fail, out = [[-1]*26], [0], [0]
    def letter(ch):
        if not 'a' <= ch <= 'z':
            raise ValueError('lowercase only')
        return ord(ch)-ord('a')
    for p in patterns:
        if not p:
            raise ValueError('empty pattern')
        v = 0
        for ch in p:
            c = letter(ch)
            if go[v][c] < 0:
                go[v][c] = len(go)
                go.append([-1]*26); fail.append(0); out.append(0)
            v = go[v][c]
        out[v] += 1
    q = deque()
    for c in range(26):
        if go[0][c] < 0: go[0][c] = 0
        else: q.append(go[0][c])
    while q:
        v = q.popleft()
        out[v] += out[fail[v]]
        for c in range(26):
            u = go[v][c]
            if u < 0: go[v][c] = go[fail[v]][c]
            else:
                fail[u] = go[fail[v]][c]
                q.append(u)
    total = v = 0
    for ch in text:
        v = go[v][letter(ch)]
        total += out[v]
    return total
print(matches(['a','ab','bab'], 'ababa'))`, '6',
 ['AC 自动机最适合哪个场景？',['多个模式扫描同一文本','仅对整数排序','图最短路','数据库提交'],0,'Trie 和失败链接让多个模式共享文本扫描。'],
 ['模式 a、aa 在 aaa 中总共匹配多少次？',['2','3','5','6'],2,'a 出现3次，aa 可重叠出现2次。'],
 '实现小写字母 AC 自动机，计数模式 a、ab、bab 在 ababa 中的全部匹配，输出6。空文本返回0，拒绝空模式。',
 'https://www.cs.cmu.edu/~ab/CMU/Week%2010-%20Strings%20Search/print04.pdf');

add('algo-suffix-array','后缀数组、LCP 与字符串索引','倍增排序 · 排名 · Kasai',
 [['把后缀排序变成位置数组','后缀数组 SA 按字典序记录字符串每个非空后缀的起始下标。它不必保存所有后缀副本，可用于模式二分、重复子串等问题。本例按 ASCII 字符排序，不包含额外终止符。'],['倍增法复用前一轮排名','第一轮按字符排名，之后用长度 k 的左右两段排名描述长度 2k 的前缀。每轮排序排名对并重新编号；当排名全不相同时即可结束。这里使用比较排序，未实现线性时间构建。'],['LCP 捕捉相邻后缀的公共部分','定义 LCP[i] 为 SA[i] 与 SA[i-1] 的最长公共前缀，LCP[0]=0。Kasai 按原位置扫描并复用减一的匹配长度，在线性时间生成 LCP。banana 的 SA 是 5、3、1、0、4、2，最大 LCP 为3，对应重复子串 ana。']],
 '不同教材的 LCP 下标定义可能相差一位；使用区间最小值查询前先统一定义。C++ 按字节处理，不能直接当作 Unicode 字符算法。',
 '比较排序倍增构建 O(n log²n) 时间、O(n) 辅助空间；Kasai O(n) 时间。Python 排序同样按排名对，未复制所有后缀。',
 String.raw`#include <iostream>
#include <vector>
#include <string>
#include <numeric>
#include <algorithm>
using namespace std;
pair<vector<int>,vector<int>> suffix_index(const string& s){
 int n=(int)s.size();vector<int>sa(n),r(n),nr(n),pos(n),lcp(n);iota(sa.begin(),sa.end(),0);
 for(int i=0;i<n;++i)r[i]=(unsigned char)s[i];
 for(int k=1;k<n;k*=2){auto key=[&](int i){return pair<int,int>{r[i],i+k<n?r[i+k]:-1};};
  sort(sa.begin(),sa.end(),[&](int a,int b){return key(a)<key(b);});nr[sa[0]]=0;
  for(int i=1;i<n;++i)nr[sa[i]]=nr[sa[i-1]]+(key(sa[i-1])!=key(sa[i]));r=nr;if(r[sa.back()]==n-1)break;}
 for(int i=0;i<n;++i)pos[sa[i]]=i;
 for(int i=0,h=0;i<n;++i){int p=pos[i];if(p==0){h=0;continue;}int j=sa[p-1];while(i+h<n&&j+h<n&&s[i+h]==s[j+h])++h;lcp[p]=h;if(h)--h;}
 return {sa,lcp};
}
int main(){auto [sa,lcp]=suffix_index("banana");for(int x:sa)cout<<x<<' ';cout<<'\n';for(int x:lcp)cout<<x<<' ';}`,
 `def suffix_index(s):
    n = len(s)
    sa, rank, k = list(range(n)), list(map(ord, s)), 1
    while k < n:
        key = lambda i: (rank[i], rank[i+k] if i+k<n else -1)
        sa.sort(key=key)
        new = [0]*n
        for i in range(1,n):
            new[sa[i]] = new[sa[i-1]] + (key(sa[i-1]) != key(sa[i]))
        rank = new
        if rank[sa[-1]] == n-1: break
        k *= 2
    pos, lcp = [0]*n, [0]*n
    for i,x in enumerate(sa): pos[x] = i
    h = 0
    for i in range(n):
        p = pos[i]
        if p == 0:
            h = 0
            continue
        j = sa[p-1]
        while i+h<n and j+h<n and s[i+h]==s[j+h]: h+=1
        lcp[p] = h
        h = max(0,h-1)
    return sa,lcp
for row in suffix_index('banana'): print(*row)`, '5 3 1 0 4 2\n0 1 3 0 0 2',
 ['SA 保存的是什么？',['字符出现次数','排序后的后缀起始位置','每个字符ASCII码','前缀的总长度'],1,'使用起始位置表示后缀，不必复制所有后缀字符串。'],
 ['banana 中后缀 ana 与 anana 的 LCP 长度是？',['1','2','3','5'],2,'共同前缀是ana，长度3。'],
 '使用排名倍增构建 banana 的后缀数组，再用 Kasai 构建本节定义的 LCP。输出两行结果；空字符串返回两个空数组。',
 'https://www.cs.cmu.edu/~15451-f16/lectures/lec13-suffixarray.pdf');

add('algo-manacher','Manacher 最长回文子串','中心对称 · 半径复用 · 线性扫描',
 [['子串必须连续','最长回文子串与最长回文子序列是不同问题。逐个中心扩展的方法容易理解，但 aaaa 等输入会反复比较相同区域，最坏达到平方时间。'],['利用最右回文的对称性','维护已经找到的最右回文区间 [l,r]。新中心落在区间内时，可从镜像中心的半径与右边界距离中取较小值作为初始半径，再向外补比较。每次真正越过右边界的扩展都会推进 r。'],['分别处理奇数与偶数长度','本例用 d1 记录含中心的奇回文半径，长度为 2*d1-1；d2 记录中心在相邻字符之间的偶回文半径，长度为 2*d2。xyzabbad 的最长回文是 abba，长度4，空串返回0。']],
 '奇数与偶数回文的镜像下标不同，不能直接照搬。这里 C++ 输入按 ASCII 字节解释；如需处理 Unicode 应先转换为统一字符序列。',
 '两次扫描共 O(n) 时间，半径数组 O(n) 空间。每个中心的初始区间来自已知回文，边界总共只向右推进线性次数。',
 String.raw`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
using namespace std;
int longest(const string& s){int n=(int)s.size(),best=0;vector<int>d1(n),d2(n);
 for(int i=0,l=0,r=-1;i<n;++i){int k=i>r?1:min(d1[l+r-i],r-i+1);while(i-k>=0&&i+k<n&&s[i-k]==s[i+k])++k;d1[i]=k;best=max(best,2*k-1);if(i+k-1>r){l=i-k+1;r=i+k-1;}}
 for(int i=0,l=0,r=-1;i<n;++i){int k=i>r?0:min(d2[l+r-i+1],r-i+1);while(i-k-1>=0&&i+k<n&&s[i-k-1]==s[i+k])++k;d2[i]=k;best=max(best,2*k);if(i+k-1>r){l=i-k;r=i+k-1;}}
 return best;}
int main(){cout<<longest("xyzabbad")<<'\n'<<longest("");}`,
 `def longest(s):
    n, best = len(s), 0
    d1, d2 = [0]*n, [0]*n
    l,r = 0,-1
    for i in range(n):
        k = 1 if i>r else min(d1[l+r-i],r-i+1)
        while i-k>=0 and i+k<n and s[i-k]==s[i+k]: k+=1
        d1[i] = k
        best = max(best,2*k-1)
        if i+k-1>r: l,r = i-k+1,i+k-1
    l,r = 0,-1
    for i in range(n):
        k = 0 if i>r else min(d2[l+r-i+1],r-i+1)
        while i-k-1>=0 and i+k<n and s[i-k-1]==s[i+k]: k+=1
        d2[i] = k
        best = max(best,2*k)
        if i+k-1>r: l,r = i-k,i+k-1
    return best
print(longest('xyzabbad'))
print(longest(''))`, '4\n0',
 ['哪一项属于回文子串？',['可以跳过任意字符','必须连续且正反相同','必须长度为奇数','只能由相同字符组成'],1,'子串要求连续，回文可为奇数或偶数长度。'],
 ['d2[i]=3 对应的偶回文长度为？',['3','5','6','7'],2,'偶数回文两侧各3个字符，总长度6。'],
 '实现奇偶两类回文半径扫描，求 xyzabbad 的最长回文子串长度，输出4；空串输出0。',
 'https://projects.csail.mit.edu/jacm/Authors/manacherglennk.html');
})();

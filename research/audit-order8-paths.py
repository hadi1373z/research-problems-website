"""Exact eight-vertex audit of the saved proper-path attachment certificate.

Input: McKay graph8.g6, SHA256 checked below; downloaded if absent.
Requires Python 3.10+ and NumPy through the saved independent verifier.
The catalogue is attributed; this does not extend full reconstruction bounds.
"""
from collections import defaultdict,Counter
from functools import lru_cache
from itertools import combinations,permutations,product
from pathlib import Path
import hashlib,json,time
import importlib.util
from urllib.request import urlopen

ROOT=Path(__file__).resolve().parent
SOURCE='https://users.cecs.anu.edu.au/~bdm/data/graph8.g6'

def decode(line):
    assert line and ord(line[0])-63<63
    n=ord(line[0])-63;bits=[]
    for c in line[1:]:
        v=ord(c)-63;assert 0<=v<64
        bits.extend((v>>k)&1 for k in range(5,-1,-1))
    assert len(bits)==((n*(n-1)//2+5)//6)*6
    assert not any(bits[n*(n-1)//2:])
    a=[0]*n;bit=0
    for j in range(1,n):
        for i in range(j):
            if bits[bit]:a[i]|=1<<j;a[j]|=1<<i
            bit+=1
    return a

def encode(a):
    n=len(a);bits=[(a[i]>>j)&1 for j in range(1,n) for i in range(j)]
    bits += [0]*((-len(bits))%6)
    return chr(63+n)+''.join(chr(63+sum(bits[i+k]<<(5-k) for k in range(6))) for i in range(0,len(bits),6))

def connected(a):
    seen=1;front=1
    while front:
        union=0
        while front:
            bit=front&-front;front-=bit;union|=a[bit.bit_length()-1]
        front=union&~seen;seen|=front
    return seen==(1<<len(a))-1

def refined_cells(a):
    n=len(a);colors=[x.bit_count() for x in a]
    while True:
        sig=[(colors[u],tuple(sorted(colors[v] for v in range(n) if a[u]>>v&1))) for u in range(n)]
        labels={s:i for i,s in enumerate(sorted(set(sig)))}
        new=[labels[s] for s in sig]
        if len(set(new))==len(set(colors)):colors=new;break
        colors=new
    return [[u for u in range(n) if colors[u]==c] for c in sorted(set(colors))]

def exact_group_and_code(a):
    n=len(a);cells=refined_cells(a);edges=[(i,j) for i,j in combinations(range(n),2) if a[i]>>j&1]
    ps=list(combinations(range(n),2));group=[];best=None
    for chunks in product(*(permutations(c) for c in cells)):
        p=list(range(n))
        for cell,images in zip(cells,chunks):
            for u,v in zip(cell,images):p[u]=v
        if all(a[p[u]]>>p[v]&1 for u,v in edges):group.append(tuple(p))
        order=sum((tuple(c) for c in chunks),())
        code=sum(1<<bit for bit,(u,v) in enumerate(ps) if a[order[u]]>>order[v]&1)
        best=code if best is None else min(best,code)
    assert tuple(range(n)) in group
    return group,best

def paths_dp(a):
    n=len(a);out=[[[0]*n for _ in range(n)] for _ in range(n)]
    for source in range(n):
        dp=[[0]*n for _ in range(1<<n)];dp[1<<source][source]=1
        for used in range(1<<n):
            if not used>>source&1:continue
            length=used.bit_count()-1
            for end,value in enumerate(dp[used]):
                if not value:continue
                out[length][source][end]+=value
                free=a[end]&~used
                while free:
                    bit=free&-free;free-=bit
                    dp[used|bit][bit.bit_length()-1]+=value
    return out

def import_previous():
    path=ROOT/'research-site/research/verify-reconstruction.py'
    if not path.exists():path=Path(__file__).with_name('verify-reconstruction.py')
    spec=importlib.util.spec_from_file_location('saved_verifier',path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    return module

def run():
    start=time.perf_counter();input_path=ROOT/'graph8.g6'
    if input_path.exists():raw=input_path.read_bytes()
    else:
        with urlopen(SOURCE,timeout=30) as response:raw=response.read(1_000_001)
        assert len(raw)<=1_000_000
    digest=hashlib.sha256(raw).hexdigest()
    assert digest=='546a249902101c97d3aa590f93e53366854bd0a6f405aa59bdb32d25c57f845a'
    lines=raw.decode('ascii').splitlines();assert len(lines)==12346 and len(set(lines))==12346
    assert [(i,j) for i,j in combinations(range(5),2) if decode('DQc')[i]>>j&1]==[(0,2),(0,4),(1,3),(3,4)]
    old=import_previous();crosschecks=0
    for n in range(3,8):
        for mask,group in old.unlabeled_graphs(n):
            a=old.adjacency(n,mask)
            if min(x.bit_count() for x in a)<2 or not connected(a):continue
            exact,_=exact_group_and_code(a)
            assert set(exact)==set(group)
            assert paths_dp(a)==old.path_tensor(a)
            crosschecks+=1
    stats=Counter();cutoffs=Counter();collisions=[];canonical_seen=set();pair_total=0
    for index,line in enumerate(lines):
        a=decode(line);assert len(a)==8 and encode(a)==line
        group,code=exact_group_and_code(a)
        assert code not in canonical_seen;canonical_seen.add(code)
        if not connected(a):continue
        stats['connected']+=1
        if min(x.bit_count() for x in a)<2:continue
        stats['eligible_cores']+=1
        paths=paths_dp(a)
        vertices=[min(p[u] for p in group) for u in range(8)]
        pair_reps=sorted({min(tuple(sorted((p[x],p[y]))) for p in group) for x in range(8) for y in range(x,8)})
        pair_total+=len(pair_reps)
        buckets=defaultdict(list)
        for x,y in pair_reps:
            signature=(tuple(sorted((vertices[x],vertices[y]))),tuple(paths[l][x][y] for l in range(7)))
            buckets[signature].append((x,y))
        bad=[v for v in buckets.values() if len(v)>1]
        if bad:
            stats['cores_with_collision']+=1
            stats['pair_orbits_in_collisions']+=sum(map(len,bad))
            if len(collisions)<20:
                # Independent DFS and unpruned 8! automorphism confirmation.
                assert paths==old.path_tensor(a)
                edges=[(u,v) for u,v in combinations(range(8),2) if a[u]>>v&1]
                full=[p for p in permutations(range(8)) if all(a[p[u]]>>p[v]&1 for u,v in edges)]
                assert set(full)==set(group)
                collisions.append({'catalogue_line':index+1,'graph6':line,'edges':edges,'automorphisms':group,'pair_classes':bad,'profiles':[[paths[l][x][y] for l in range(7)] for x,y in bad[0]]})
        else:
            stats['cores_separated']+=1
            for cutoff in range(7):
                signatures={(tuple(sorted((vertices[x],vertices[y]))),tuple(paths[l][x][y] for l in range(cutoff+1))) for x,y in pair_reps}
                if len(signatures)==len(pair_reps):cutoffs[str(cutoff)]+=1;break
        if stats['eligible_cores']%1000==0:print(json.dumps({'eligible_cores':stats['eligible_cores'],'collision_cores':stats['cores_with_collision'],'elapsed_seconds':round(time.perf_counter()-start,1)}),flush=True)
    assert stats['connected']==11117
    result={'date':'2026-11-02','scope':'Exact audit of a restricted attachment signature. Not a full-deck counterexample search or an extension of the known 13-vertex reconstruction bound.','catalogue':{'author':'Brendan McKay','url':SOURCE,'sha256':digest,'graphs':len(lines),'exact_canonical_codes':len(canonical_seen)},'independent_algorithm_crosschecks':crosschecks,'statistics':dict(stats),'pair_orbits':pair_total,'minimum_sufficient_cutoff_histogram':dict(cutoffs),'collision_examples':collisions}
    (ROOT/'order8-path-audit.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print(json.dumps(result,indent=2),flush=True)

if __name__=='__main__':run()

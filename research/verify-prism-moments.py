"""Exact tests of reconstruction of arbitrarily weighted clique-prism cores.

The solver sees only unlabeled leaf-card configurations, never the source
weights. A separate test extracts them from independently relabeled graphs.
Python standard library only. Finite tests do not certify the general proof.
"""
from collections import Counter,defaultdict
from itertools import combinations
from pathlib import Path
import json,random

def canonical(columns):
    columns=[tuple(p) for p in columns]
    return min(tuple(sorted(columns)),tuple(sorted((b,a) for a,b in columns)))

def moments(columns):
    return (sum(a*a+b*b for a,b in columns),sum(a*b for a,b in columns),(sum(a-b for a,b in columns))**2)

def leaf_deck(columns):
    result=Counter()
    for i,(a,b) in enumerate(columns):
        for row,q in enumerate((a,b)):
            if not q:continue
            card=[list(p) for p in columns];card[i][row]-=1
            result[canonical(card)]+=q
    return result

def recover(deck):
    r=sum(deck.values());assert r>=3
    totals=[sum(count*moments(c)[k] for c,count in deck.items()) for k in range(3)]
    numerators=[totals[0]-r,totals[1],totals[2]-r]
    assert all(v%(r-2)==0 for v in numerators)
    q_global,p_global,d2_global=[v//(r-2) for v in numerators]
    restored=set();used_cards=0
    for card in deck:
        imbalance=sum(a-b for a,b in card)
        if imbalance==0:continue
        directions=[sign for sign in (1,-1) if (imbalance+sign)**2==d2_global]
        assert len(directions)==1
        row=0 if directions[0]==1 else 1
        card_q,card_p,_=moments(card)
        assert (q_global-card_q+1)%2==0
        missing=(q_global-card_q+1)//2
        partner=p_global-card_p
        candidates=[i for i,pair in enumerate(card) if pair[row]==missing-1 and pair[1-row]==partner]
        assert candidates
        for i in candidates:
            c=[list(p) for p in card];c[i][row]+=1;restored.add(canonical(c))
        used_cards+=1
    assert used_cards>0 and len(restored)==1
    return next(iter(restored))

def compositions(length,total):
    if length==1:yield (total,);return
    for v in range(total+1):
        for tail in compositions(length-1,total-v):yield (v,)+tail

def graph(columns):
    s=len(columns);r=sum(a+b for a,b in columns);n=2*s+r;a=[0]*n
    def edge(u,v):a[u]|=1<<v;a[v]|=1<<u
    for i,j in combinations(range(2*s),2):
        if i//s==j//s or j==i+s:edge(i,j)
    nxt=2*s
    for i,pair in enumerate(columns):
        for row,q in enumerate(pair):
            for _ in range(q):edge(i+row*s,nxt);nxt+=1
    return a

def remove(a,v):
    keep=[u for u in range(len(a)) if u!=v]
    return [sum(1<<j for j,w in enumerate(keep) if a[u]>>w&1) for u in keep]

def relabel(a,rng):
    order=list(range(len(a)));rng.shuffle(order)
    return [sum(1<<j for j,v in enumerate(order) if a[u]>>v&1) for u in order]

def extract(card):
    """Recognize H_s and recover ordered-column weights, with no fixed labels."""
    n=len(card);leaves={u for u in range(n) if card[u].bit_count()==1}
    core=set(range(n))-leaves
    assert len(core)>=6 and len(core)%2==0
    # The complement of H_s is connected bipartite K_(s,s) minus a matching.
    color={min(core):0};queue=[min(core)]
    for u in queue:
        for v in core:
            if u==v or card[u]>>v&1:continue
            if v not in color:color[v]=1-color[u];queue.append(v)
            else:assert color[v]!=color[u]
    assert set(color)==core
    rows=[[u for u in core if color[u]==c] for c in (0,1)]
    assert len(rows[0])==len(rows[1])
    s=len(rows[0]);columns=[];partners=[]
    for row in rows:
        assert all(card[u]>>v&1 for u,v in combinations(row,2))
    for u in rows[0]:
        other=[v for v in rows[1] if card[u]>>v&1]
        assert len(other)==1;v=other[0];partners.append(v)
        columns.append((sum(card[u]>>w&1 for w in leaves),sum(card[v]>>w&1 for w in leaves)))
    assert len(set(partners))==s
    assert all(sum(card[w]>>u&1 for u in core)==1 for w in leaves)
    return canonical(columns)

def run():
    records=[];configurations=0;all_restorations=0;moment_collision=None
    for s in range(3,7):
        for r in range(1,9):
            configs={canonical(tuple(zip(v[:s],v[s:]))) for v in compositions(2*s,r)}
            groups=defaultdict(list)
            same_moments={}
            for a in sorted(configs):
                deck=leaf_deck(a);key=tuple(sorted(deck.items()));groups[key].append(a)
                if r>=3:
                    assert recover(deck)==a
                    all_restorations+=1
                    key_m=moments(a)
                    if key_m in same_moments and moment_collision is None:
                        other=same_moments[key_m]
                        assert leaf_deck(other)!=deck
                        moment_collision={'clique_size':s,'leaves':r,'moments_Q_R_D2':key_m,'columns_A':other,'columns_B':a,'leaf_decks_different':True}
                    same_moments[key_m]=a
            if r!=2:assert all(len(g)==1 for g in groups.values())
            else:assert len(configs)==4 and len(groups)==1
            configurations+=len(configs)
            records.append({'clique_size':s,'leaves':r,'configuration_orbits':len(configs),'distinct_leaf_decks':len(groups),'maximum_collision':max(map(len,groups.values()))})
        print(json.dumps({'clique_size_complete':s,'configurations_checked':configurations}),flush=True)
    rng=random.Random(20261102);graph_checks=0;stress=0
    for s in range(3,8):
        for _ in range(8):
            r=rng.randrange(3,14);slots=[0]*(2*s)
            for _ in range(r):slots[rng.randrange(2*s)]+=1
            a=canonical(tuple(zip(slots[:s],slots[s:])))
            g=graph(a);cards=[relabel(remove(g,v),rng) for v in range(len(g)) if g[v].bit_count()==1]
            observed=Counter(extract(c) for c in cards)
            assert observed==leaf_deck(a)
            assert recover(observed)==a;graph_checks+=1
    for _ in range(120):
        s=rng.randrange(8,41);a=canonical(tuple((rng.randrange(21),rng.randrange(21)) for _ in range(s)))
        assert recover(leaf_deck(a))==a;stress+=1
    example=canonical(((1,1),(1,0),(0,1),(0,0)))
    assert moment_collision is not None
    result={'date':'2026-11-02','scope':'Exact finite checks of a written general theorem; not independent proof review or a novelty certificate.','classification':records,'configuration_orbits_checked':configurations,'moment_reconstructions_checked':all_restorations,'independently_relabeled_graph_decks_checked':graph_checks,'larger_random_weighted_configs_checked':stress,'random_seed':20261102,'example_beyond_absent_predecessor_rule':{'columns':example,'leaves':4,'moments_Q_R_D2':moments(example),'restored':recover(leaf_deck(example))},'moments_alone_are_insufficient':moment_collision,'theorem_scope':'H_s=K_s box K_2, s>=3; direct pendant attachments. Leaf-deck reconstruction for r=1 or r>=3. Exactly four types share the r=2 leaf-deck; full cards resolve that case by the saved path certificate.'}
    Path(__file__).with_name('prism-moments-verification.json').write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print(json.dumps(result,indent=2))

if __name__=='__main__':run()

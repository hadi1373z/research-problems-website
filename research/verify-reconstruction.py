"""Exact search for a two-leaf attachment reconstruction certificate.

No claim of a general reconstruction proof or literature novelty.
Generate all unlabeled small cores by explicit permutation orbits; do not
identify graphs using spectra, approximate invariants, or only a hash.
"""
from collections import defaultdict, Counter
from functools import lru_cache
from itertools import combinations, permutations, product
from pathlib import Path
import json
import numpy as np


def pairs(n): return list(combinations(range(n),2))

def adjacency(n,mask):
    result=[0]*n
    for bit,(u,v) in enumerate(pairs(n)):
        if (mask>>bit)&1:result[u]|=1<<v;result[v]|=1<<u
    return result


def connected(a):
    seen=1;front=1
    while front:
        neighbors=0
        for u in range(len(a)):
            if (front>>u)&1:neighbors|=a[u]
        front=neighbors&~seen;seen|=front
    return seen==(1<<len(a))-1


def unlabeled_graphs(n):
    """Complete graph representatives, by exact exhaustive S_n orbit marking."""
    ps=pairs(n);index={p:i for i,p in enumerate(ps)}
    perms=list(permutations(range(n)))
    images=np.array([[1<<index[tuple(sorted((p[u],p[v])))] for u,v in ps] for p in perms],dtype=np.uint32)
    seen=np.zeros(1<<len(ps),dtype=bool)
    for mask in range(len(seen)):
        if seen[mask]:continue
        orbit=np.zeros(len(perms),dtype=np.uint32)
        for bit in range(len(ps)):
            if (mask>>bit)&1:orbit|=images[:,bit]
        seen[orbit]=True
        yield mask, [perms[i] for i in np.flatnonzero(orbit==mask)]


def orbit_labels(n,automorphisms):
    vo=[min(p[u] for p in automorphisms) for u in range(n)]
    po={xy:min(tuple(sorted((p[xy[0]],p[xy[1]]))) for p in automorphisms) for xy in combinations_with_repetition(n)}
    return vo,po


def combinations_with_repetition(n):
    return [(x,y) for x in range(n) for y in range(x,n)]


def path_tensor(a):
    """P_l[x][y]: vertex-simple paths from x to y with l edges; P_0=I."""
    n=len(a);result=[[[0]*n for _ in range(n)] for _ in range(n)]
    for source in range(n):
        def extend(end,used,length):
            result[length][source][end]+=1
            for nxt in range(n):
                if (a[end]>>nxt)&1 and not (used>>nxt)&1:
                    extend(nxt,used|(1<<nxt),length+1)
        extend(source,1<<source,0)
    return result


def path_count(a,k):
    if k>len(a):return 0
    if k==1:return len(a)
    # Count ordinary unoriented subgraphs isomorphic to P_k, not induced paths.
    count=0
    def extend(end,used,remaining):
        if remaining==0:return 1
        return sum(extend(v,used|(1<<v),remaining-1) for v in range(len(a)) if (a[end]>>v)&1 and not (used>>v)&1)
    for x in range(len(a)):count+=extend(x,1<<x,k-1)
    return count//2


def remove(a,v):
    keep=[u for u in range(len(a)) if u!=v]
    return [sum(1<<j for j,w in enumerate(keep) if (a[u]>>w)&1) for u in keep]


def attach(a,x,y):
    n=len(a);b=a.copy()+[1<<x,1<<y]
    b[x]|=1<<n;b[y]|=1<<(n+1)
    return b


@lru_cache(maxsize=None)
def canonical(a):
    """Exact canonical adjacency code; degree refinement only prunes permutations."""
    n=len(a);colors=[x.bit_count() for x in a]
    while True:
        sig=[(colors[u],tuple(sorted(colors[v] for v in range(n) if (a[u]>>v)&1))) for u in range(n)]
        labels={s:i for i,s in enumerate(sorted(set(sig)))}
        new=[labels[s] for s in sig]
        if len(set(new))==len(set(colors)):colors=new;break
        colors=new
    cells=[[u for u in range(n) if colors[u]==c] for c in sorted(set(colors))]
    codes=[]
    ps=pairs(n)
    for chunks in product(*(permutations(cell) for cell in cells)):
        order=sum((tuple(c) for c in chunks),())
        codes.append(sum(1<<bit for bit,(i,j) in enumerate(ps) if (a[order[i]]>>order[j])&1))
    return n,min(codes)


def deck(a):return tuple(sorted(canonical(tuple(remove(a,v))) for v in range(len(a))))


def occupancy_vectors(length,total):
    if length==1:
        yield (total,);return
    for first in range(total+1):
        for tail in occupancy_vectors(length-1,total-first):yield (first,)+tail


def check_leaf_multiplicities():
    # The triangular prism: all label-orbits and leaf decks for 1..8 leaves.
    n=6;edges=[(i,j) for i,j in pairs(n) if (i//3==j//3 or j==i+3)]
    mask=sum(1<<pairs(n).index(e) for e in edges)
    automorphisms=[p for p in permutations(range(n)) if all(((u,v) in edges)==(tuple(sorted((p[u],p[v]))) in edges) for u,v in pairs(n))]
    assert len(automorphisms)==12
    def vector_code(a):return min(tuple(a[p[i]] for i in range(n)) for p in automorphisms)
    counts=[];gap_checks=0;norm_checks=0
    for r in range(1,9):
        orbit_reps=sorted(set(vector_code(a) for a in occupancy_vectors(n,r)))
        groups=defaultdict(list)
        certified=[]
        for a in orbit_reps:
            cards=[]
            for i,q in enumerate(a):
                if q:
                    b=list(a);b[i]-=1
                    cards.extend([vector_code(tuple(b))]*q)
            groups[tuple(sorted(cards))].append(a)
            if r!=2:
                norm=sum(x*x for x in a)
                total=sum(sum(x*x for x in b) for b in cards)
                assert total-r==(r-2)*norm
                norm_checks+=1
                for b in cards:
                    missing=(norm-sum(x*x for x in b)+1)//2
                    candidates=[i for i,v in enumerate(b) if v==missing-1]
                    assert candidates
                    if len(candidates)==1:
                        restored=list(b);restored[candidates[0]]+=1
                        assert vector_code(tuple(restored))==a
                        certified.append(a);gap_checks+=1
                        break
        for members in groups.values():
            if any(a in certified for a in members):assert len(members)==1
        counts.append({'leaves':r,'occupancy_orbits':len(orbit_reps),'distinct_leaf_decks':len(groups),'largest_leaf_deck_collision':max(map(len,groups.values())),'unique_coordinate_certificates':len(certified)})
    # Independently test the combinatorial threshold, including its boundary.
    threshold_checks=0
    for h in range(3,8):
        boundary=tuple(range(h))
        assert sum(boundary)==h*(h-1)//2
        assert not any(q>0 and q-1 not in boundary for q in boundary)
        # Every way to distribute threshold+1 leaves has a gap for h<=5.
        if h<=5:
            for a in occupancy_vectors(h,h*(h-1)//2+1):
                assert any(q>0 and q-1 not in a for q in a)
                threshold_checks+=1
    # Check the prism path signature claimed for every clique-prism K_s box K_2.
    prism=[]
    for s in range(3,10):
        a=[sum(1<<j for j in range(2*s) if i!=j and (i//s==j//s or abs(i-j)==s)) for i in range(2*s)]
        def profile(x,y):return [int(x==y),int(bool((a[x]>>y)&1)),(a[x]&a[y]).bit_count() if x!=y else 0]
        values=[profile(0,0),profile(0,1),profile(0,s),profile(0,s+1)]
        assert values==[[1,0,0],[0,1,s-2],[0,1,0],[0,0,2]]
        prism.append({'clique_size':s,'pair_signatures':values})
    return {'triangular_prism_leaf_decks':counts,'norm_identity_orbits_checked':norm_checks,'restoration_certificates_checked':gap_checks,'all_threshold_occupancies_checked':threshold_checks,'clique_prism_signatures':prism}


def run():
    records=[];example=None;failure=None;identity_checks=0;deck_checks=0
    for n in range(3,8):
        total=0;cores=0;all_pass=0;pair_count=0;certified=0;distance_ambiguous=0
        for mask,automorphisms in unlabeled_graphs(n):
            total+=1;a=adjacency(n,mask)
            if min(x.bit_count() for x in a)<2 or not connected(a):continue
            cores+=1;vo,po=orbit_labels(n,automorphisms);paths=path_tensor(a)
            representatives=sorted(set(po.values()));groups=defaultdict(list);distance_groups=defaultdict(list)
            for x,y in representatives:
                profile=tuple(paths[l][x][y] for l in range(n-1))
                signature=(tuple(sorted((vo[x],vo[y]))),profile)
                distance=next((l for l in range(n) if paths[l][x][y]),None)
                groups[signature].append((x,y))
                distance_groups[(signature[0],distance)].append((x,y))
            singleton=[members[0] for members in groups.values() if len(members)==1]
            if len(singleton)==len(representatives):all_pass+=1
            pair_count+=len(representatives);certified+=len(singleton)
            distance_ambiguous+=sum(len(members) for members in distance_groups.values() if len(members)>1)
            if failure is None:
                bad=[members for members in groups.values() if len(members)>1]
                if bad:failure={'n':n,'edges':[list(e) for bit,e in enumerate(pairs(n)) if (mask>>bit)&1], 'pairs':bad[0]}
            if example is None and len(automorphisms)>1:
                for ds,members in distance_groups.items():
                    good=[xy for xy in members if xy in singleton]
                    # A genuinely symmetric core; same endpoint orbits and distance.
                    if len(good)>1:
                        x,y=good[0];s,t=good[1]
                        example={'n':n,'edges':[list(e) for bit,e in enumerate(pairs(n)) if (mask>>bit)&1], 'automorphism_count':len(automorphisms),'pairs':[list(good[0]),list(good[1])],'endpoint_orbits':ds[0],'distance':ds[1], 'profiles':[[paths[l][u][v] for l in range(n-1)] for u,v in good[:2]]}
            # Verify every pair for cores <=5. For each larger core, choose
            # distinct bases at maximum distance, then maximize the path sum.
            # Taking the first pair would always choose the trivial (0,0) case.
            def sample_key(xy):
                x,y=xy
                distance=next(l for l in range(n) if paths[l][x][y])
                return (int(x!=y),distance,sum(paths[l][x][y] for l in range(n-1)))
            samples=representatives if n<=5 else [max(representatives,key=sample_key)]
            for x,y in samples:
                b=attach(a,x,y);gu=remove(b,n);gv=remove(b,n+1)
                for l in range(n-1):
                    k=l+3
                    numerator=sum(path_count(remove(b,v),k) for v in range(n+2))
                    assert numerator%(n+2-k)==0
                    from_deck=numerator//(n+2-k)
                    recovered=from_deck-path_count(gu,k)-path_count(gv,k)+path_count(a,k)
                    assert recovered==paths[l][x][y],(n,mask,x,y,l,recovered)
                    identity_checks+=1
            # Cross-check that the complete candidate decks are distinct for
            # every pair orbit of the small cores, including uncertified ones.
            if n<=6:
                all_decks=[deck(attach(a,x,y)) for x,y in representatives]
                assert len(set(all_decks))==len(representatives)
                deck_checks+=len(all_decks)
        records.append({'core_order':n,'all_unlabeled_graphs':total,'connected_min_degree_2_cores':cores,'cores_where_all_pair_orbits_separated':all_pass,'pair_orbits':pair_count,'pair_orbits_certified':certified,'pair_orbits_not_separated_by_distance':distance_ambiguous})
        print(json.dumps(records[-1]),flush=True)
    out={'date':'2026-11-02','scope':'Exact finite certificate checks, not a proof of the full reconstruction conjecture or a novelty claim.','records':records,'example_strictly_beyond_distance':example,'first_unseparated_example':failure,'kelly_inclusion_exclusion_checks':identity_checks,'complete_extension_decks_compared':deck_checks,'leaf_multiplicity_checks':check_leaf_multiplicities()}
    Path(__file__).with_name('reconstruction-verification.json').write_text(json.dumps(out,indent=2)+'\n',encoding='utf8')
    print(json.dumps(out,indent=2))


if __name__=='__main__':run()

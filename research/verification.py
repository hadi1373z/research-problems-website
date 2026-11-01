"""Finite checks for the accompanying research report. These are not general proofs.

Run with Python 3.10+ and NumPy. No network access is used.
"""
from collections import Counter, deque
from itertools import combinations, product
from math import comb, exp, log, sqrt, ceil
from fractions import Fraction
from pathlib import Path
import json
import numpy as np


def rook_and_shrikhande():
    vertices = list(product(range(4), repeat=2))
    generators = {(1, 0), (3, 0), (0, 1), (0, 3), (1, 1), (3, 3)}
    rook = np.zeros((16, 16), dtype=np.int64)
    shrikhande = rook.copy()
    for i, (x, y) in enumerate(vertices):
        for j, (u, v) in enumerate(vertices):
            if i != j:
                rook[i, j] = int(x == u or y == v)
                shrikhande[i, j] = int(((u-x) % 4, (v-y) % 4) in generators)
    results = {}
    for name, a in [('rook', rook), ('shrikhande', shrikhande)]:
        assert np.all(a.sum(axis=1) == 6)
        assert np.array_equal(a @ a, 4*np.eye(16, dtype=np.int64) + 2*np.ones((16,16),dtype=np.int64))
        spectrum = Counter(int(round(x)) for x in np.linalg.eigvalsh(a))
        k4 = sum(all(a[i,j] for i,j in combinations(q,2)) for q in combinations(range(16),4))
        results[name] = {'spectrum': dict(sorted(spectrum.items())), 'K4_count': k4}
    assert results['rook']['spectrum'] == results['shrikhande']['spectrum'] == {-2:9, 2:6, 6:1}
    assert results['rook']['K4_count'] == 8
    assert results['shrikhande']['K4_count'] == 0
    return results


def multipartite_checks():
    cases = 0
    for k in (2, 3):
        for sizes in product((1, 2), repeat=k+1):
            labels = [i for i, s in enumerate(sizes) for _ in range(s)]
            edges = [(i,j) for i,j in combinations(range(len(labels)),2) if labels[i] != labels[j]]
            optimum = min(sum(colors[i] == colors[j] for i,j in edges)
                          for colors in product(range(k), repeat=len(labels)))
            predicted = min(x*y for x,y in combinations(sizes,2))
            assert optimum == predicted
            cases += 1
    # The displayed sample bound controls all coupon failures by at most 1/3.
    probability_checks = 0
    for k in range(2,8):
        for j in range(1,11):
            raw = [1 + ((i+2)*(j+3) % 13) for i in range(k+1)]
            ps = sorted(x/sum(raw) for x in raw)
            epsilon = ps[0]*ps[1]
            q = ceil(max(log(6)/(k*epsilon), log(6*k)/sqrt(epsilon)))
            failure_union_bound = sum(exp(-q*p) for p in ps)
            assert failure_union_bound <= 1/3 + 1e-12
            probability_checks += 1
    return {'full_vertex_coloring_cases': cases, 'coupon_bound_cases': probability_checks}


def bipartite_cospectral_checks():
    results=[]
    for r in range(1,9):
        n=8*r
        def graph(a,b):
            mat=np.zeros((n,n),dtype=np.int64)
            mat[:a,a:a+b]=1
            mat[a:a+b,:a]=1
            return mat
        g,h=graph(2*r,2*r),graph(4*r,r)
        assert np.allclose(np.linalg.eigvalsh(g),np.linalg.eigvalsh(h), atol=1e-10)
        assert int(g.sum()) == int(h.sum()) == 8*r*r
        assert np.count_nonzero(g.sum(axis=1)) == 4*r
        assert np.count_nonzero(h.sum(axis=1)) == 5*r
        # Characteristic polynomial exactly: x^(8r-2) (x^2-4r^2).
        results.append({'r':r,'order':n,'edges':4*r*r,'nonzero_eigenvalues':[-2*r,2*r]})
    return results


def triangle_packing_checks():
    cases=0
    for sizes in product(range(1,6),repeat=3):
        a,b,c=sorted(sizes)
        packing=[(('A',i),('B',j),('C',(i+j)%c)) for i in range(a) for j in range(b)]
        used=set()
        for triangle in packing:
            for edge in combinations(triangle,2):
                key=frozenset(edge)
                assert key not in used
                used.add(key)
        assert len(packing) == a*b == min(x*y for x,y in combinations(sizes,2))
        cases+=1
    epsilon=Fraction(4,400)
    density=Fraction(8,8000)
    assert density*density == epsilon**3
    return {'latin_triangle_packings_checked':cases,'equality_example':{'n':20,'parts':[2,2,2], 'isolates':14, 'epsilon':str(epsilon),'triangle_density':str(density)}}


def c4_exhaustive(max_n=6):
    results=[]
    for n in range(4,max_n+1):
        pairs=list(combinations(range(n),2))
        index={p:i for i,p in enumerate(pairs)}
        def mask_for(es):
            return sum(1<<index[tuple(sorted(p))] for p in es)
        triangles=[mask_for(combinations(t,2)) for t in combinations(range(n),3)]
        fours=[]
        for q in combinations(range(n),4):
            total=mask_for(combinations(q,2))
            # Three distinct 4-cycles on this four-vertex set.
            a,b,c,d=q
            cycles={mask_for(es) for es in [((a,b),(b,c),(c,d),(d,a)),((a,b),(b,d),(d,c),(c,a)),((a,c),(c,b),(b,d),(d,a))]}
            fours.append((total,cycles))
        size=1<<len(pairs)
        counts=[sum((mask&total) in cycles for total,cycles in fours) for mask in range(size)]
        distances=[-1]*size
        queue=deque()
        for mask,cnt in enumerate(counts):
            if cnt==0:
                distances[mask]=0
                queue.append(mask)
        while queue:
            mask=queue.popleft()
            for bit in range(len(pairs)):
                nxt=mask^(1<<bit)
                if distances[nxt]<0:
                    distances[nxt]=distances[mask]+1
                    queue.append(nxt)
        triangle_free_far=0
        for mask in range(size):
            if distances[mask] and not any(mask&t == t for t in triangles):
                tau=distances[mask]
                epsilon=Fraction(tau,n*n)
                lhs=Fraction(counts[mask],n**4)
                assert lhs >= epsilon**5/4
                assert counts[mask] >= tau
                triangle_free_far+=1
        results.append({'order':n,'graphs_checked':size,'triangle_free_graphs_at_positive_C4_distance':triangle_free_far,'max_induced_C4_edit_distance':max(distances)})
    return results


def local_network_checks():
    # Exact binomial calculation: k=1, rho(t)=t, f=+-1.
    data=[]
    for n in [8,16,32,64,128,256]:
        mean_absolute=sum(Fraction(comb(n,j),2**n)*abs(Fraction(2*j-n,n)) for j in range(n+1))
        second=Fraction(1,n)
        fourth=Fraction(3*n*n-2*n,n**4)
        assert fourth <= 3*second*second
        assert float(mean_absolute) <= 1/sqrt(n)+1e-12
        probability=sum(Fraction(comb(n,j),2**n) for j in range(n+1)
                        if (2*j-n)**2*2 >= n)
        assert probability >= Fraction(1,12)
        data.append({'n':n,'E_abs_sample_mean':float(mean_absolute),'sqrt_n_times_error':sqrt(n)*float(mean_absolute)})
    return data


def main():
    result={
      'scope':'Finite verification only; none of these computations settles an unrestricted open problem.',
      'graph_isomorphism_obstruction':rook_and_shrikhande(),
      'multipartite_coloring':multipartite_checks(),
      'cospectral_bipartite_pairs':bipartite_cospectral_checks(),
      'triangle_removal_subclass':triangle_packing_checks(),
      'induced_C4_triangle_free_subclass':c4_exhaustive(),
      'network_sampling_and_slow_rate_moment_checks':local_network_checks(),
    }
    output=Path(__file__).with_name('verification-results.json')
    output.write_text(json.dumps(result,indent=2)+'\n',encoding='utf8')
    print(json.dumps(result,indent=2))


if __name__=='__main__':
    main()

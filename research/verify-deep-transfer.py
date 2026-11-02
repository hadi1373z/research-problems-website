"""Checks accompanying the 2 November 2026 deep-IWN transfer draft.

Requires Python 3.10+ and NumPy. Finite computations do not certify the theorem.
The exact checks use Fraction; Monte Carlo is labeled separately.
"""
from fractions import Fraction as F
from functools import lru_cache
from itertools import combinations, permutations, product
from math import comb, exp, lgamma, log, log1p, pi, sqrt
from pathlib import Path
import json
import numpy as np


def partial_matchings(p, q):
    for s in range(min(p, q)+1):
        for inputs in combinations(range(p), s):
            for outputs in permutations(range(q), s):
                yield tuple(zip(inputs, outputs))


def tensor_operator(x, q, matching):
    """Normalized partial matching, including repeated free indices."""
    p=x.ndim
    n=x.shape[0] if p else tensor_operator.n
    inputs=sorted(i for i, _ in matching)
    output_by_input=dict(matching)
    free=tuple(i for i in range(p) if i not in inputs)
    marginal=x.mean(axis=free) if free else x
    sorted_output=sorted(output_by_input[i] for i in inputs)
    if len(inputs)>1:
        permutation=[inputs.index(next(i for i in inputs if output_by_input[i]==o)) for o in sorted_output]
        marginal=np.transpose(marginal, permutation)
    shape=tuple(n if o in sorted_output else 1 for o in range(q))
    return np.broadcast_to(np.asarray(marginal).reshape(shape), (n,)*q)


def tensor_operator_reference(x, q, matching, n):
    p=x.ndim
    fixed=dict(matching)
    free=[i for i in range(p) if i not in fixed]
    result=np.zeros((n,)*q)
    for out in product(range(n), repeat=q):
        total=0.
        for new in product(range(n), repeat=len(free)):
            inp=[None]*p
            for i, j in matching:
                inp[i]=out[j]
            for i, v in zip(free, new):
                inp[i]=v
            total+=float(x[tuple(inp)])
        result[out]=total/n**len(free)
    return result


def check_tensor_basis():
    rng=np.random.default_rng(20261102)
    n=3
    tensor_operator.n=n
    cases=0
    for p in range(4):
        x=np.asarray(rng.uniform(-1,1,size=(n,)*p))
        for q in range(4):
            for matching in partial_matchings(p,q):
                fast=tensor_operator(x,q,matching)
                slow=tensor_operator_reference(x,q,matching,n)
                assert np.allclose(fast,slow,atol=2e-14,rtol=0)
                assert np.max(np.abs(fast))<=np.max(np.abs(x))+1e-14
                r=p-len(matching)
                big_n=8
                good=F(1)
                for j in range(r):
                    good*=F(big_n-q-j,big_n)
                d=q*r+comb(r,2)
                assert 1-good<=F(d,big_n)
                cases+=1
    return {'arities':list(range(4)),'partial_matchings_checked':cases,
            'comparison':'Vectorized operators versus explicit sums; sup norm and collision bound checked.'}


def edges(k):
    return tuple(combinations(range(k),2))


@lru_cache(None)
def types(k):
    return tuple((b,e) for b in product((0,1),repeat=k) for e in product((0,1),repeat=comb(k,2)))


W=((F(1,4),F(3,4)),(F(3,4),F(1,2)))


@lru_cache(None)
def conditional_rows(p,q,matching):
    """Exact Bernoulli-type transition probabilities for a two-block graphon."""
    fixed=dict(matching)
    input_edges=edges(p)
    output_edge_index={ij:k for k,ij in enumerate(edges(q))}
    rows=[]
    for out_blocks,out_bits in types(q):
        row=[]
        for index,(blocks,bits) in enumerate(types(p)):
            if any(blocks[i]!=out_blocks[o] for i,o in matching):
                continue
            probability=F(1,2)**(p-len(matching))
            compatible=True
            for edge_index,(i,j) in enumerate(input_edges):
                if i in fixed and j in fixed:
                    out_pair=tuple(sorted((fixed[i],fixed[j])))
                    if bits[edge_index]!=out_bits[output_edge_index[out_pair]]:
                        compatible=False
                        break
                else:
                    probability*=W[blocks[i]][blocks[j]] if bits[edge_index] else 1-W[blocks[i]][blocks[j]]
            if compatible and probability:
                row.append((index,probability))
        assert sum(weight for _,weight in row)==1
        rows.append(tuple(row))
    return tuple(rows)


def type_operator(field,p,q,matching):
    return [sum((field[index]*weight for index,weight in row),F(0))
            for row in conditional_rows(p,q,matching)]


def check_type_basis():
    cases=0
    rows=0
    for p in range(4):
        field=[F((i*7%13)-6,6) for i in range(len(types(p)))]
        for q in range(4):
            for matching in partial_matchings(p,q):
                values=type_operator(field,p,q,matching)
                assert all(abs(v)<=1 for v in values)
                rows+=len(values)
                cases+=1
    # Shared vertices create dependence unless their latent type is conditioned on.
    edge_field=[F(bits[0]) for blocks,bits in types(2)]
    degree=type_operator(edge_field,2,1,((0,0),))
    shared_product=[F(bits[0]*bits[1]) for blocks,bits in types(3)]
    joint=type_operator(shared_product,3,1,((0,0),))
    mean=sum(degree,F(0))/2
    unconditional_covariance=sum(joint,F(0))/2-mean*mean
    assert unconditional_covariance==F(1,256)>0
    conditional_covariances=[]
    for d,joint_probability in zip(degree,joint):
        conditional_covariances.append(joint_probability-d*d)
    assert conditional_covariances==[0,0]
    return {'partial_matchings_checked':cases,'conditional_rows_checked':rows,
            'probabilities':'Exact Fraction row sums and contraction bounds.',
            'unconditional_shared_vertex_covariance':str(unconditional_covariance),
            'conditional_covariances':[str(x) for x in conditional_covariances]}


def binomial_hinge_exact(trials, probability, threshold):
    return sum((F(comb(trials,x))*probability**x*(1-probability)**(trials-x)*max(F(x)-threshold,0)
                for x in range(trials+1)),F(0))


def expected_threshold_network_exact(n,p=F(1,2),theta=F(1,4)):
    # Off-diagonal common neighbors and the different diagonal degree term.
    off=binomial_hinge_exact(n-2,p*p,n*theta)/n
    diagonal=binomial_hinge_exact(n-1,p,n*theta)/n
    return F(n-1,n)*off+diagonal/n


def exhaustive_threshold_network():
    results=[]
    for n in range(2,7):
        pairs=edges(n)
        total=0
        for mask in range(1<<len(pairs)):
            adjacency=np.zeros((n,n),dtype=np.int64)
            for bit,(i,j) in enumerate(pairs):
                if mask & (1<<bit):
                    adjacency[i,j]=adjacency[j,i]=1
            common=adjacency@adjacency
            total+=int(np.maximum(4*common-n,0).sum())
        observed=F(total,(1<<len(pairs))*4*n**3)
        predicted=expected_threshold_network_exact(n)
        assert observed==predicted
        results.append({'n':n,'graphs':1<<len(pairs),'expected_output_exact':str(predicted)})
    return results


def binomial_hinge_float(trials, probability, threshold):
    terms=[]
    lp=log(probability)
    lq=log1p(-probability)
    base=lgamma(trials+1)
    for x in range(max(0,int(threshold)+1),trials+1):
        weight=exp(base-lgamma(x+1)-lgamma(trials-x+1)+x*lp+(trials-x)*lq)
        terms.append((x-threshold)*weight)
    return sum(terms)


def asymptotic_threshold_table():
    constant=sqrt(F(3,16)/(2*pi))
    data=[]
    for n in [16,32,64,128,256,512,1024,2048,4096,8192]:
        value=(n-1)/n*binomial_hinge_float(n-2,.25,n*.25)/n+binomial_hinge_float(n-1,.5,n*.25)/n**2
        if n<=128:
            assert abs(value-float(expected_threshold_network_exact(n)))<2e-12
        upper=1.25/sqrt(n)+2.75/n
        assert value<=upper
        data.append({'n':n,'expected_output':value,'sqrt_n_times_expected_output':sqrt(n)*value,'proved_upper_bound':upper})
    return {'asymptotic_constant':constant,'table':data}


def relu(values):
    return [max(x,0) for x in values]


def exact_deep_limit():
    adjacency=[F(bits[0]) for blocks,bits in types(2)]
    signal=[F(-1 if blocks[0]==0 else 1) for blocks,bits in types(2)]
    a13=type_operator(adjacency,2,3,((0,0),(1,2)))
    a23=type_operator(adjacency,2,3,((0,1),(1,2)))
    a12=type_operator(adjacency,2,3,((0,0),(1,1)))
    f1=type_operator(signal,2,3,((0,0),(1,1)))
    g1=relu([a+b-1 for a,b in zip(a13,a23)])
    g2=relu([a/2-f/4+F(1,10) for a,f in zip(a12,f1)])
    pool1=type_operator(g1,3,2,((0,0),(1,1)))
    pool2=type_operator(g1,3,2,((0,0),))
    local2=type_operator(g2,3,2,((0,0),(1,1)))
    h1=relu([v-F(1,4) for v in pool1])
    h2=relu([F(2,5)*a+F(3,5)*b-F(1,10) for a,b in zip(pool2,local2)])
    h2_transposed=type_operator(h2,2,2,((0,1),(1,0)))
    global_h2=type_operator(h2,2,2,())
    h3=relu([F(7,10)*a+F(1,5)*b+F(1,10)*c-F(1,20) for a,b,c in zip(h1,h2_transposed,global_h2)])
    limit=type_operator(h3,2,0,())[0]
    assert all(0<=x<=1 for field in [g1,g2,h1,h2,h3] for x in field)
    return limit


def finite_deep(adjacency,signal):
    n=len(signal)
    tensor_operator.n=n
    g1=np.maximum(adjacency[:,None,:]+adjacency[None,:,:]-1,0)
    g2=np.broadcast_to(np.maximum(.5*adjacency[:,:,None]-.25*signal[:,None,None]+.1,0),(n,n,n))
    pool1=tensor_operator(g1,2,((0,0),(1,1)))
    pool2=tensor_operator(g1,2,((0,0),))
    local2=tensor_operator(g2,2,((0,0),(1,1)))
    h1=np.maximum(pool1-.25,0)
    h2=np.maximum(.4*pool2+.6*local2-.1,0)
    h3=np.maximum(.7*h1+.2*h2.T+.1*h2.mean()-.05,0)
    assert all(np.min(x)>=-1e-14 and np.max(x)<=1+1e-14 for x in [g1,g2,h1,h2,h3])
    return float(h3.mean())


def deep_monte_carlo():
    limit=exact_deep_limit()
    rng=np.random.default_rng(112026)
    block_matrix=np.array([[.25,.75],[.75,.5]])
    results=[]
    repetitions=120
    for n in [12,24,48,96]:
        errors=[]
        for _ in range(repetitions):
            block=rng.integers(0,2,size=n)
            probabilities=block_matrix[block[:,None],block[None,:]]
            upper=np.triu(rng.random((n,n))<probabilities,k=1)
            adjacency=(upper|upper.T).astype(float)
            signal=2*block-1
            errors.append(abs(finite_deep(adjacency,signal)-float(limit)))
        # This confidence summary is descriptive, not a proof or independence audit.
        results.append({'n':n,'repetitions':repetitions,'mean_absolute_error':float(np.mean(errors)),
                        'standard_error':float(np.std(errors,ddof=1)/sqrt(repetitions)),
                        'sqrt_n_times_mean_error':sqrt(n)*float(np.mean(errors)),
                        'coarse_proved_bound':6/sqrt(n-3)+22/n})
    return {'limit_exact':str(limit),'limit_decimal':float(limit),'table':results}


def holder_exact_table():
    data=[]
    for exponent in [1.,.5,.25]:
        values=[]
        for n in [16,32,64,128,256]:
            value=sum(float(F(comb(n,j),2**n))*abs((2*j-n)/n)**exponent for j in range(n+1))
            values.append({'n':n,'expected_output':value,'n_to_beta_times_error':n**(exponent/2)*value})
        data.append({'product_of_holder_exponents':exponent,'predicted_power':exponent/2,'table':values})
    return data


def main():
    results={
      'date':'2026-11-02',
      'scope':'Exact finite checks and labeled numerical experiments. Not a formal proof, independent review, or novelty certificate.',
      'finite_partial_matching_basis':check_tensor_basis(),
      'conditional_type_basis':check_type_basis(),
      'threshold_network_exact_enumeration':exhaustive_threshold_network(),
      'threshold_network_root_n_sharpness':asymptotic_threshold_table(),
      'four_layer_network':deep_monte_carlo(),
      'holder_exponent_checks':holder_exact_table()
    }
    target=Path(__file__).with_name('deep-transfer-verification.json')
    target.write_text(json.dumps(results,indent=2)+'\n',encoding='utf8')
    print(json.dumps(results,indent=2))


if __name__=='__main__':
    main()

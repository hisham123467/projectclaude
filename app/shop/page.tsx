'use client';
import {useMemo,useState} from 'react';
import {products} from '@/lib/products';
import {ProductCard} from '@/components/store';
export default function Shop(){const [sort,setSort]=useState('featured');const list=useMemo(()=>[...products].sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:0),[sort]);return <main className="inner"><small>TUSCARA LONDON</small><div className="shopHead"><h1>SHOP TUSCARA</h1><select value={sort} onChange={e=>setSort(e.target.value)}><option value="featured">Featured</option><option value="new">Newest</option><option value="low">Price Low → High</option><option value="high">Price High → Low</option></select></div><div className="shopGrid">{list.map(p=><ProductCard key={p.slug} p={p}/>)}</div></main>}
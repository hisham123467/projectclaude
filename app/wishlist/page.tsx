'use client';
import {products} from '@/lib/products';
import {ProductCard,useStore} from '@/components/store';
export default function Wishlist(){const {wishlist}=useStore();const saved=products.filter(p=>wishlist.includes(p.slug));return <main className="inner"><small>TUSCARA LONDON</small><h1>SAVED PIECES</h1>{saved.length?<div className="shopGrid">{saved.map(p=><ProductCard key={p.slug} p={p}/>)}</div>:<p>No saved pieces yet.</p>}</main>}
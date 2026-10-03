'use client';
import Link from 'next/link';
import Image from 'next/image';
import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {Heart,Menu,Search,ShoppingBag,User,X,Minus,Plus} from 'lucide-react';
import {Product,products,pkr} from '@/lib/products';

type Item=Product&{qty:number,size?:string,color?:string};
type Ctx={add:(p:Product,o?:{size?:string;color?:string})=>void;wish:(p:Product)=>void;wishlist:string[]};
const Store=createContext<Ctx|null>(null);
export const useStore=()=>{const c=useContext(Store);if(!c)throw new Error('Store missing');return c};

export function StoreProvider({children}:{children:React.ReactNode}){
 const [cart,setCart]=useState<Item[]>([]),[wishlist,setWishlist]=useState<string[]>([]),[bag,setBag]=useState(false),[search,setSearch]=useState(false),[menu,setMenu]=useState(false),[q,setQ]=useState('');
 useEffect(()=>{try{setCart(JSON.parse(localStorage.getItem('tuscara_cart')||'[]'));setWishlist(JSON.parse(localStorage.getItem('tuscara_wishlist')||'[]'))}catch{}},[]);
 useEffect(()=>{localStorage.setItem('tuscara_cart',JSON.stringify(cart))},[cart]);useEffect(()=>{localStorage.setItem('tuscara_wishlist',JSON.stringify(wishlist))},[wishlist]);
 const add=(p:Product,o?:{size?:string;color?:string})=>{setCart(c=>{const i=c.findIndex(x=>x.slug===p.slug&&x.size===o?.size&&x.color===o?.color);return i>=0?c.map((x,j)=>j===i?{...x,qty:x.qty+1}:x):[...c,{...p,qty:1,...o}]});setBag(true)};
 const wish=(p:Product)=>setWishlist(w=>w.includes(p.slug)?w.filter(x=>x!==p.slug):[...w,p.slug]);
 const count=cart.reduce((a,b)=>a+b.qty,0),subtotal=cart.reduce((a,b)=>a+b.price*b.qty,0);
 const results=useMemo(()=>products.filter(p=>(p.name+' jacket outerwear').toLowerCase().includes(q.toLowerCase())),[q]);
 return <Store.Provider value={{add,wish,wishlist}}>
  <header className="header"><button className="mobile" onClick={()=>setMenu(true)}><Menu/></button><Link className="logo" href="/"><b>T U S C A R A</b><span>L O N D O N</span></Link><nav><Link href="/shop">Shop</Link><Link href="/shop">Men</Link><Link href="/shop">Women</Link><Link href="/shop">Collections</Link><Link href="/shop">New Arrivals</Link><Link href="/lookbook">Lookbook</Link><Link href="/about">About</Link></nav><div className="tools"><button onClick={()=>setSearch(true)}><Search/></button><Link className="desktop" href="/account"><User/></Link><Link className="desktop" href="/wishlist"><Heart/></Link><button className="bag" onClick={()=>setBag(true)}><ShoppingBag/><i>{count}</i></button></div></header>
  {children}
  <div className={'shade '+(menu||bag?'show':'')} onClick={()=>{setMenu(false);setBag(false)}}/>
  <aside className={'menu '+(menu?'show':'')}><button className="close" onClick={()=>setMenu(false)}><X/></button>{['SHOP','NEW ARRIVALS','MEN','WOMEN','JACKETS','COLLECTIONS','LOOKBOOK','ABOUT'].map(x=><Link key={x} href={x==='LOOKBOOK'?'/lookbook':x==='ABOUT'?'/about':'/shop'} onClick={()=>setMenu(false)}>{x}</Link>)}</aside>
  <aside className={'drawer '+(bag?'show':'')}><div className="drawerHead"><div><small>YOUR BAG</small><h3>{count} ITEMS</h3></div><button onClick={()=>setBag(false)}><X/></button></div><div className="lines">{cart.length===0&&<p>Your bag is empty.</p>}{cart.map((x,i)=><div className="line" key={x.slug+i}><Image src={x.image} width={80} height={100} alt={x.alt}/><div><b>{x.name}</b><span>{x.size||'M'} · {x.color||'Default'}</span><span>{pkr(x.price)}</span><div className="qty"><button onClick={()=>setCart(c=>c.map((z,j)=>j===i?{...z,qty:Math.max(1,z.qty-1)}:z))}><Minus/></button><em>{x.qty}</em><button onClick={()=>setCart(c=>c.map((z,j)=>j===i?{...z,qty:z.qty+1}:z))}><Plus/></button></div></div></div>)}</div><div className="drawerFoot"><div><span>SUBTOTAL</span><b>{pkr(subtotal)}</b></div><Link href="/checkout" onClick={()=>setBag(false)}>CHECKOUT</Link></div></aside>
  <section className={'search '+(search?'show':'')}><button className="close" onClick={()=>setSearch(false)}><X/></button><div><small>SEARCH TUSCARA</small><input autoFocus={search} value={q} onChange={e=>setQ(e.target.value)} placeholder="Type to search"/><p>Popular: Jackets · Black · Olive · New Arrivals</p><div className="results">{(q?results:products.slice(0,3)).map(p=><Link key={p.slug} href={'/products/'+p.slug} onClick={()=>setSearch(false)}><Image src={p.image} width={75} height={95} alt={p.alt}/><span><b>{p.name}</b><i>{pkr(p.price)}</i></span></Link>)}</div></div></section>
 </Store.Provider>
}

export function ProductCard({p}:{p:Product}){const {add,wish,wishlist}=useStore();return <article className="product"><div className="pic"><Link href={'/products/'+p.slug}><Image src={p.image} fill sizes="(max-width:700px) 50vw,25vw" alt={p.alt}/></Link><button className={'heart '+(wishlist.includes(p.slug)?'active':'')} onClick={()=>wish(p)}><Heart fill={wishlist.includes(p.slug)?'currentColor':'none'}/></button><button className="quick" onClick={()=>add(p)}>QUICK ADD</button></div><Link href={'/products/'+p.slug}>{p.name}</Link><span>{pkr(p.price)}</span><div className="dots">{p.colors.map(c=><i key={c} style={{background:c}}/>)}</div></article>}
export type Product={slug:string;name:string;price:number;image:string;alt:string;colors:string[]};
export const products:Product[]=[
{slug:'olive-varsity-jacket',name:'Olive Varsity Jacket',price:12500,image:'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=1000&q=85',alt:'Olive varsity outerwear campaign placeholder',colors:['#55543e','#171512','#6e2e25']},
{slug:'black-jacket',name:'Black Jacket',price:13500,image:'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=85',alt:'Black premium jacket campaign placeholder',colors:['#141414','#3b2c23']},
{slug:'brown-jacket',name:'Brown Jacket',price:13500,image:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85',alt:'Brown fashion jacket campaign placeholder',colors:['#4a3427','#1a1714']},
{slug:'classic-black-jacket',name:'Classic Black Jacket',price:12000,image:'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85',alt:'Classic black jacket campaign placeholder',colors:['#111','#4a372e']}
];
export const pkr=(n:number)=>'PKR '+n.toLocaleString('en-PK');
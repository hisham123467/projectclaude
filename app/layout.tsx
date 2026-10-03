import type {Metadata} from 'next';
import './globals.css';
import {StoreProvider} from '@/components/store';
export const metadata:Metadata={title:{default:'Tuscara London',template:'%s | Tuscara London'},description:'Premium outerwear and modern clothing from Tuscara London.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body><StoreProvider>{children}</StoreProvider></body></html>}
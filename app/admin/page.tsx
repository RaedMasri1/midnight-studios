import type {Metadata} from 'next';
import Dashboard from './dashboard';
export const metadata:Metadata={title:'Studio dashboard | Midnight Studios',robots:{index:false,follow:false},alternates:{canonical:null}};
export default function AdminPage(){return <Dashboard/>;}

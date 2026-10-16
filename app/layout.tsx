import type { Metadata, Viewport } from 'next';
import { pageMetadata, siteOrigin, siteIndexable, studioDescription, StudioData } from './seo';
import './globals.css';
export const metadata:Metadata={
 ...pageMetadata({title:'Midnight Studios | Independent Game Development Studio',description:studioDescription,path:'/'}),
 metadataBase:new URL(siteOrigin),
 applicationName:'Midnight Studios',
 robots:{index:siteIndexable,follow:siteIndexable,googleBot:{index:siteIndexable,follow:siteIndexable,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
 icons:{icon:[{url:'/favicon-96.png?v=050',sizes:'96x96',type:'image/png'},{url:'/favicon-192.png?v=050',sizes:'192x192',type:'image/png'},{url:'/favicon.ico?v=050',sizes:'16x16 32x32 48x48 64x64',type:'image/x-icon'}],shortcut:'/favicon.ico?v=050',apple:{url:'/apple-touch-icon.png?v=050',sizes:'180x180',type:'image/png'}},
};
export const viewport:Viewport={themeColor:'#000000',colorScheme:'dark',width:'device-width',initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><head><link rel="preload" href="/assets/manrope-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head><body className="bg-studio-black font-sans text-studio-white antialiased"><StudioData/>{children}</body></html>}

import './globals.css';
import Nav from './nav';
export const metadata = { title: 'EbookYa' };
export default function RootLayout({ children }) {
  return (<html lang="es"><body><Nav /><main>{children}</main></body></html>);
}

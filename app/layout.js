import { IBM_Plex_Sans_Arabic} from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import ConditionalLayout from '@/components/layout/ConditionalLayout.jsx';

const IBM = IBM_Plex_Sans_Arabic({
  subsets: ["latin", "arabic"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
});
export const metadata = {
  title: {
    template: 'Global Divers - %s',
    default: 'Global Divers Hurghada',
  },
  description: "Experience the Red Sea's Beauty",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${IBM.className}`}>
        <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick={true}
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
      </body>
    </html>
  );
}

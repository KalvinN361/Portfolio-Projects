import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/fendstyles.css";
import { UserProvider } from "@supabase/auth-helpers-react";
import { supabaseClient } from "@supabase/auth-helpers-nextjs";
import Script from "next/script";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@fontsource/manrope";
import Footer from "../components/Footer";

function MyApp({ Component, pageProps }) {
	return (
		<div className="container-fluid">
			<UserProvider supabaseClient={supabaseClient}>
				<Component {...pageProps} />
				<ToastContainer autoClose={6000} />
				<Script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" />
			</UserProvider>
			<div className="row footerGone flex position-absolute  start-50 translate-middle align-bottom">
				<div className="col-md-12 col-sm-12 col-12">
					<div className="text-center footermedia">
						<Footer className="mt-auto" />
					</div>
				</div>
			</div>
		</div>
	);
}

export default MyApp;

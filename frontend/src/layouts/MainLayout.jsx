import { Outlet } from "react-router";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";

export default function MainLayout(){
	return (
		<div className="layout">
			<Header/>
			<main className="content">
				<Outlet/>
			</main>
			<Footer/>
		</div>
	);
}
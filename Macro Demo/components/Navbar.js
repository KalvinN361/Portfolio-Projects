import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import Image from "next/image";
import Modal from "react-modal";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useUser, Auth } from "@supabase/supabase-auth-helpers/react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const customStyles = {
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		bottom: "auto",
		marginRight: "-50%",
		width: "25%",
		transform: "translate(-50%, -50%)",
		fontWeight: "bold",
		borderRadius: "19px",
	},
};

export default function Navbar() {
	const [modalIsOpen, setIsOpen] = React.useState(false);
	const [modalOption, setModalOption] = useState("sign_in");

	function openModal() {
		setIsOpen(true);
	}

	function afterOpenModal() {
		// references are now sync'd and can be accessed.
		// subtitle.style.color = "#f00";
	}

	function closeModal() {
		setIsOpen(false);
	}

	return (
		<>
			<nav className="navbar navbar-expand-lg navbar-dark py-3 fixed-static-top">
				<Link href="/">
					<a className={styles.brand}>Wee Macro</a>
				</Link>
				<button
					className="navbar-toggler navtogglercolor"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navmenu"
				>
					<span className="navbar-toggler-icon"></span>
				</button>

				<div
					className="mr-5 collapse navbar-collapse justify-content-end "
					id="navmenu"
				>
					<ul className="navbar-nav ">
						<li className="nav-item">
							<Link href="/">
								<a className="nav-link linkHomeB">Home</a>
							</Link>
						</li>
						<li className="nav-item">
							<Link href="/about">
								<a className="nav-link linkB">About</a>
							</Link>
						</li>
						<li className="nav-item">
							<Link href="/order">
								<a className="nav-link linkB">Order</a>
							</Link>
						</li>
						<li className="nav-item">
							<a
								className="nav-link linkB"
								href="mailto:kalvin.win59@gmail.com"
								target="_blank"
							>
								Contact Me
							</a>
						</li>
						<li className="nav-item">
							{false && (
								<button
									className="nav-link modal-button loginbutton  "
									onClick={() => {
										setModalOption("sign_in");
										openModal();
									}}
								>
									Login{" "}
								</button>
							)}
						</li>
						<li className="nav-item">
							{false && (
								<button
									className="nav-link modal-button signupbutton"
									onClick={() => {
										setModalOption("sign_up");
										openModal();
									}}
								>
									Sign-up
								</button>
							)}
						</li>
					</ul>
				</div>
			</nav>

			<Modal
				ariaHideApp={false}
				isOpen={modalIsOpen}
				onAfterOpen={afterOpenModal}
				onRequestClose={closeModal}
				style={customStyles}
				contentLabel="Example Modal"
				id={"signup-Modal"}
			>
				<div className="row">
					<div className="col-7">
						<h2 className="modalheader">
							{(modalOption == "sign_in" && "Sign in") || "Create account"}
						</h2>
					</div>
				</div>
				<Auth
					// socialColors={true}
					view={modalOption}
					supabaseClient={supabase}
					socialButtonSize="xlarge"
				/>
			</Modal>
		</>
	);
}

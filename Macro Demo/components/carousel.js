import React, { Component } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { Carousel } from "react-responsive-carousel";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
export default class NextJsCarousel extends Component {
	render() {
		return (
			<div className="row">
				<Carousel>
					<div>
						<img src="../images/main.png" />
						<div className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										location.href = "/order";
									}}
								>
									Order Now
								</button>
							</div>
						</div>
					</div>
					<div>
						<img src="../images/cucumber.png" />
						<div className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										location.href = "/order";
									}}
								>
									Order Now
								</button>
							</div>
						</div>
					</div>
					<div>
						<img src="../images/newburger.png" />
						<div className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										location.href = "/order";
									}}
								>
									Order Now
								</button>
							</div>
						</div>
					</div>
					<div>
						<img src="../images/newpasta.png" />
						<div className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										location.href = "/order";
									}}
								>
									Order Now
								</button>
							</div>
						</div>
					</div>
					<div>
						<img src="../images/steak5.png" />
						<div className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										location.href = "/order";
									}}
								>
									Order Now
								</button>
							</div>
						</div>
					</div>
				</Carousel>
			</div>
		);
	}
}

import React, { Component } from "react";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from "react-responsive-carousel";
import styles from "../styles/Home.module.css";

export default class NextJsCarousel extends Component {
	render() {
		return (
			<div className="row">
				<Carousel>
					<div>
						<img src="../images/main.png" />
						<p className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										router.push("/order");
									}}
								>
									Order Now
								</button>
							</div>
						</p>
					</div>
					<div>
						<img src="../images/cucumber.png" />
						<p className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										router.push("/order");
									}}
								>
									Order Now
								</button>
							</div>
						</p>
					</div>
					<div>
						<img src="../images/newburger.png" />
						<p className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										router.push("/order");
									}}
								>
									Order Now
								</button>
							</div>
						</p>
					</div>
					<div>
						<img src="../images/newpasta.png" />
						<p className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										router.push("/order");
									}}
								>
									Order Now
								</button>
							</div>
						</p>
					</div>
					<div>
						<img src="../images/steak5.png" />
						<p className="legend">
							<h2 className={styles.foodheader}>Wee Macro</h2>
							<p className="my-2">MAKING DELICIOUS MEALS SINCE 2021</p>
							<div className={styles.openaccbuttondiv}>
								<button
									className={styles.openaccbutton}
									onClick={() => {
										router.push("/order");
									}}
								>
									Order Now
								</button>
							</div>
						</p>
					</div>
				</Carousel>
			</div>
		);
	}
}

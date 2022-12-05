import styles from "../styles/OrderComp.module.css";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import PieChart from "./PieChart";
import { UserData } from "./Data";
import { createClient } from "@supabase/supabase-js";
import Modal from "react-modal";
import backarrow from "../public/images/backarrow.png";
import { loadStripe } from "@stripe/stripe-js";

const supabase = createClient(
	process.env.NEXT_PUBLIC_SUPABASE_URL,
	process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const customStyles = {
	content: {
		top: "50%",
		left: "50%",
		right: "auto",
		// bottom: "auto",
		// marginRight: "-50%",
		// width: "25%",
		transform: "translate(-50%, -50%)",
		// fontWeight: "bold",
		borderRadius: "19px",
		height: "70%",
		minWidth: "20%",
	},
};

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function OrderComp(props) {
	const [macroNumbers, setmacroNumbers] = useState(null);
	const [viewingFood, setViewingFood] = useState(null);

	const [localMacroInformation, setLocalMacroInformation] = useState(
		props.getMacroInfo()
	);
	// console.log("localMacroInformation", localMacroInformation);
	const [originalCalorieData, setOriginalCalorieData] = useState({});

	const getUserData = () => {
		if (props.getMacroInfo() !== null) {
			UserData[0].percent = localMacroInformation.carbs;
			UserData[1].percent = localMacroInformation.fats;
			UserData[2].percent = localMacroInformation.proteins;
		}
		const userData = {
			labels: ["Carbs", "Fats", "Proteins"],
			datasets: [
				{
					label: "Macros",
					data: [UserData[0].percent, UserData[1].percent, UserData[2].percent],
					backgroundColor: ["rgba(75,192,192,1)", "#50AF95", "#ccf0f9"],
				},
			],
		};
		return userData;
	};
	const [userData, setUserData] = useState(getUserData());
	useEffect(() => {
		if (Object.keys(originalCalorieData).length === 0) {
			setOriginalCalorieData(props.getCalorieData());
		}
		const ud = getUserData();
		setUserData(ud);
		// Add together macros from localMacroInformation to get 100% of macros and then set the attributres to be relative to the total
		const fixedPercentages = {
			carbs: parseInt(
				(parseInt(localMacroInformation.carbs) /
					parseInt(
						localMacroInformation.carbs +
							localMacroInformation.fats +
							localMacroInformation.proteins
					)) *
					100
			),
			fats: parseInt(
				(parseInt(localMacroInformation.fats) /
					parseInt(
						localMacroInformation.carbs +
							localMacroInformation.fats +
							localMacroInformation.proteins
					)) *
					100
			),
			proteins: parseInt(
				(parseInt(localMacroInformation.proteins) /
					parseInt(
						localMacroInformation.carbs +
							localMacroInformation.fats +
							localMacroInformation.proteins
					)) *
					100
			),
		};
		setmacroNumbers(fixedPercentages);

		// update the estimated weight based on new calorie data
	}, [localMacroInformation]);

	// const userData = getUserData();
	// const [userData, setUserData] = useState({
	//   labels: UserData.map((data) => data.type),
	//   datasets: [
	//     {
	//       label: "Macros",
	//       data: UserData.map((data) => data.percent),
	//       backgroundColor: ["rgba(75,192,192,1)", "#50AF95", "#ecf0f1"],
	//     },
	//   ],
	// });

	const [fetchError, setFetchError] = useState(null);
	const [food, setFood] = useState(null);

	function weightCalc(type) {
		if (type == "carbs") {
			return props.getWeightData().carbs;
		} else if (type == "fats") {
			return props.getWeightData().fats;
		} else if (type == "proteins") {
			return props.getWeightData().proteins;
		}
	}

	function calorieCalc(type) {
		if (type == "carbs") {
			return props.getCalorieData().carbs;
		} else if (type == "fats") {
			return props.getCalorieData().fats;
		} else if (type == "proteins") {
			return props.getCalorieData().proteins;
		}
	}

	useEffect(() => {
		setmacroNumbers(props.getMacroInfo());

		async function fetchFood() {
			const { data, error } = await supabase.from("food").select();

			if (error) {
				setFetchError("Could not fetch food");
				setFood(null);
				console.log(error);
			}
			if (data) {
				setFood(data);
				setFetchError(null);
			}
		}
		fetchFood();
	}, []);

	const [foodDetails, setfoodDetails] = useState(null);

	const [modalFoodDetails, setmodalFoodDetails] = useState(false);
	function getCalorieTotals() {
		const currentCalories = props.getCalorieData();
		const totalCalories =
			currentCalories.carbs + currentCalories.fats + currentCalories.proteins;
		return totalCalories;
	}
	function openDetailsModal() {
		setmodalFoodDetails(true);
	}

	function closeModal() {
		setmodalFoodDetails(false);
	}

	function viewFood() {
		setViewingFood(true);
	}

	function backStep() {
		setViewingFood(false);
	}

	React.useEffect(() => {
		// Check to see if this is a redirect back from Checkout
		const query = new URLSearchParams(window.location.search);
		if (query.get("success")) {
			console.log("Order placed! You will receive an email confirmation.");
		}

		if (query.get("canceled")) {
			console.log(
				"Order canceled -- continue to shop around and checkout when you’re ready."
			);
		}
	}, []);

	function changeCarbPercent(e) {
		// the value of e is the relative change, e-value = 1 means .1% change
		// console.log("e", e);

		let newCarbPercent = (e.target.value - 50) / 100;
		const prevCals = props.getCalorieData();
		const originalCarbCals = originalCalorieData.carbs;
		const carbCals = originalCarbCals;
		const prevWeight = props.getWeightData();
		props.weightDataSetter({
			carbs: parseInt((carbCals + originalCarbCals * newCarbPercent) / 4),
			fats: prevWeight.fats,
			proteins: prevWeight.proteins,
		});
		props.calorieDataSetter({
			carbs: parseInt(carbCals + originalCarbCals * newCarbPercent),
			fats: prevCals.fats,
			proteins: prevCals.proteins,
		});
		setLocalMacroInformation({
			carbs:
				(parseInt(carbCals + carbCals * newCarbPercent) /
					(parseInt(carbCals + carbCals * newCarbPercent) +
						prevCals.fats +
						prevCals.proteins)) *
				100,
			fats:
				(parseInt(prevCals.fats) /
					(parseInt(carbCals + carbCals * newCarbPercent) +
						prevCals.fats +
						prevCals.proteins)) *
				100,
			proteins:
				(prevCals.proteins /
					(parseInt(carbCals + carbCals * newCarbPercent) +
						prevCals.fats +
						prevCals.proteins)) *
				100,
		});
	}

	function changeFatPercent(e) {
		// the value of e is the relative change, e-value = 1 means .1% change
		// console.log("e", e);
		let newFatPercent = (e.target.value - 50) / 100;
		const prevCals = props.getCalorieData();
		const originalFatCals = originalCalorieData.fats;
		const fatCals = originalFatCals;
		const prevWeight = props.getWeightData();
		props.weightDataSetter({
			carbs: prevWeight.carbs,
			fats: parseInt((fatCals + originalFatCals * newFatPercent) / 9),
			proteins: prevWeight.proteins,
		});
		props.calorieDataSetter({
			carbs: prevCals.carbs,
			fats: parseInt(fatCals + originalFatCals * newFatPercent),
			proteins: prevCals.proteins,
		});
		setLocalMacroInformation({
			carbs:
				(prevCals.carbs /
					(prevCals.carbs +
						parseInt(fatCals + fatCals * newFatPercent) +
						prevCals.proteins)) *
				100,
			fats:
				(parseInt(fatCals + fatCals * newFatPercent) /
					(prevCals.carbs +
						parseInt(fatCals + fatCals * newFatPercent) +
						prevCals.proteins)) *
				100,
			proteins:
				(prevCals.proteins /
					(prevCals.carbs +
						parseInt(fatCals + fatCals * newFatPercent) +
						prevCals.proteins)) *
				100,
		});
	}

	function changeProteinPercent(e) {
		// the value of e is the relative change, e-value = 1 means .1% change

		let newProteinPercent = (e.target.value - 50) / 100;
		const prevCals = props.getCalorieData();
		const originalProteinCals = originalCalorieData.proteins;
		const proteinCals = originalProteinCals;
		const prevWeight = props.getWeightData();
		props.weightDataSetter({
			carbs: prevWeight.carbs,
			fats: prevWeight.fats,
			proteins: parseInt(
				(proteinCals + originalProteinCals * newProteinPercent) / 4
			),
		});
		props.calorieDataSetter({
			carbs: prevCals.carbs,
			fats: prevCals.fats,
			proteins: parseInt(proteinCals + originalProteinCals * newProteinPercent),
		});
		setLocalMacroInformation({
			carbs:
				(prevCals.carbs /
					(prevCals.carbs +
						prevCals.fats +
						parseInt(proteinCals + proteinCals * newProteinPercent))) *
				100,
			fats:
				(prevCals.fats /
					(prevCals.carbs +
						prevCals.fats +
						parseInt(proteinCals + proteinCals * newProteinPercent))) *
				100,
			proteins:
				(parseInt(proteinCals + proteinCals * newProteinPercent) /
					(prevCals.carbs +
						prevCals.fats +
						parseInt(proteinCals + proteinCals * newProteinPercent))) *
				100,
		});
	}

	const [value, setValue] = useState(50);
	const MAX = 100;
	const getBackgroundSize = () => {
		return {
			backgroundSize: `${(value * 100) / MAX}% 100%`,
		};
	};

	const [value1, setValue1] = useState(50);
	const MAX1 = 100;
	const getBackgroundSize1 = () => {
		return {
			backgroundSize: `${(value1 * 100) / MAX1}% 100%`,
		};
	};

	const [value2, setValue2] = useState(50);
	const MAX2 = 100;
	const getBackgroundSize2 = () => {
		return {
			backgroundSize: `${(value2 * 100) / MAX2}% 100%`,
		};
	};

	function submitOrder(e) {
		e.preventDefault();
		const order = {
			name: foodDetails.name,
			price: parseInt(foodDetails.price * 100),
			image: foodDetails.thumbnail_url,
		};
		console.log(order);
		// send request to /api/checkout with order as body, and go to returned url
		fetch("/api/checkout_sessions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(order),
		})
			.then((res) => res.json())
			.then((data) => {
				window.location.href = data.url;
			});
	}

	//  button to remove ingredient from list
	function removeIngredient() {
		e.preventDefault();
		const ingredient = e.target.value;
		const newIngredients = ingredients.filter((ing) => ing !== ingredient);
		setIngredients(newIngredients);
	}

	return (
		<>
			<div className="">
				{/* <h1>Enter order</h1>
      <div className="input-group justify-content-center">
        <input
          type="text"
          className="form-control caloriesinput"
          placeholder="Enter your desired calories"
          aria-label="Text input with segmented dropdown button"
        />
        <div class="input-group-append">
          <button
            type="button"
            className="btn btn-outline-secondary submitBtnCalories"
          >
            Submit
          </button>
        </div>
      </div> */}
				<div className="row">
					<div className="col-md-8 col-12 orderingcarddiv1">
						<div className="card border-primary mb-3 orderingcard1 ">
							{viewingFood != true ? (
								<div>
									<div className="row">
										<h1 className="numbercaloriesmeal">
											{macroNumbers ? macroNumbers.calories : 0}
										</h1>
										<p className="numbercaloriesmeal2">Calories per Meal</p>
									</div>
									<hr className="orderingHr"></hr>
									<div className="row">
										<div className="col-md-6 col-sm-12 col-12">
											<p className="mealnametag">Name</p>
										</div>
										<div className="col-md-6 col-sm-12 col-12">
											<p className="mealpricetag">Price</p>
										</div>
									</div>
									{fetchError && <p>{fetchError}</p>}
									{food && (
										<div className="row groupmealtag">
											{food.map((food) => (
												<>
													<div className="col-md-1 col-sm-2 col-12 nameofmealtag Mtop">
														<img
															className="foodpicture"
															src={food.thumbnail_url}
														/>
													</div>
													<div className="col-md-5 col-sm-4 col-12 nameofmealtag Mtop">
														{food.name}
													</div>
													<div className="col-md-2 col-sm-2 col-12 costofmealtag Mtop">
														${food.price}
													</div>
													<div className="col-md-3 col-sm-3 col-12 Mtop">
														<button
															className="cartBTN"
															onClick={() => {
																setfoodDetails(food);
																console.log(food);
																viewFood();
															}}
														>
															View Details
														</button>
													</div>
												</>
											))}
										</div>
									)}
								</div>
							) : null}
							{viewingFood == true ? (
								<div className="card border-primary mb-3 checkoutcard ">
									<div className="row">
										<div>
											<button className="arrow" onClick={backStep}>
												<Image src={backarrow} />
											</button>
										</div>
										<div className="checkouthead">
											<h1 className="fooddetailsname">
												{foodDetails ? foodDetails.name : null}
											</h1>
										</div>
									</div>
									<hr></hr>

									{foodDetails != null ? (
										<>
											<div>
												<img
													className="foodpicture2"
													src={foodDetails.thumbnail_url}
												/>
											</div>
											<div className="row slidertitles">
												<div className="row">
													<div className="col-md-4">
														<p className="slidertitletext">Carbs</p>
														<input
															className="slider"
															type="range"
															min="0"
															max={MAX}
															onChange={(e) => {
																setValue(e.target.value);
																changeCarbPercent(e);
															}}
															style={getBackgroundSize()}
															value={value}
														/>
													</div>
													<div className="col-md-4">
														<p className="slidertitletext">Fats</p>

														<input
															className="slider1"
															type="range"
															min="0"
															max={MAX1}
															onChange={(e) => {
																setValue1(e.target.value);
																changeFatPercent(e);
															}}
															style={getBackgroundSize1()}
															value={value1}
														/>
													</div>
													<div className="col-md-4">
														<p className="slidertitletext">Proteins</p>
														<input
															className="slider2"
															type="range"
															min="0"
															max={MAX2}
															onChange={(e) => {
																setValue2(e.target.value);
																changeProteinPercent(e);
															}}
															style={getBackgroundSize2()}
															value={value2}
														/>
													</div>
												</div>
											</div>
											<div className="row foodcategory">
												<div className="col-3 foodbreakdown foodItem ">
													Item
												</div>
												<div className="col-3 foodbreakdown">Weight</div>
												<div className="col-3 foodbreakdown">Calories</div>
											</div>
											{foodDetails.ingredients != null
												? foodDetails.ingredients.data.map((ingredient) => (
														<div
															key={ingredient.name}
															className="row fooddetailtext"
														>
															<div className="col-3 margin-left">
																<p className="food-margin-left">
																	{ingredient.name}
																</p>
															</div>

															<div className="col-3">
																<p className="food-margin-left2">
																	{weightCalc(ingredient.macro)}

																	{ingredient.unit}
																</p>
															</div>
															<div className="col-3">
																<p className="food-margin-left3">
																	{calorieCalc(ingredient.macro)}
																</p>
															</div>
															<div className="col-2">
																{/* <button
                                  className="removebtn"
                                  onClick={() => {
                                    removeIngredient();
                                  }}
                                >
                                  {" "}
                                  Remove
                                </button> */}
															</div>
														</div>
												  ))
												: null}
											<div className="row checkoutbtncenter">
												<form className="checkoutbtncenter">
													<button
														type="submit"
														role="link"
														className="button button-margin"
													>
														<p
															className="ordernowtxt"
															onClick={(e) => submitOrder(e)}
														>
															Order Now
														</p>

														<svg
															className="button__svg"
															role="presentational"
															viewBox="0 0 600 600"
														>
															<defs>
																<clipPath id="myClip">
																	<rect x="0" y="0" width="100%" height="50%" />
																</clipPath>
															</defs>
															<g clipPath="url(#myClip)">
																<g id="money">
																	<path
																		d="M441.9,116.54h-162c-4.66,0-8.49,4.34-8.62,9.83l.85,278.17,178.37,2V126.37C450.38,120.89,446.56,116.52,441.9,116.54Z"
																		fill="#699e64"
																		stroke="#323c44"
																		strokeMiterlimit="10"
																		strokeWidth="14"
																	/>
																	<path
																		d="M424.73,165.49c-10-2.53-17.38-12-17.68-24H316.44c-.09,11.58-7,21.53-16.62,23.94-3.24.92-5.54,4.29-5.62,8.21V376.54H430.1V173.71C430.15,169.83,427.93,166.43,424.73,165.49Z"
																		fill="#699e64"
																		stroke="#323c44"
																		strokeMiterlimit="10"
																		strokeWidth="14"
																	/>
																</g>
																<g id="creditcard">
																	<path
																		d="M372.12,181.59H210.9c-4.64,0-8.45,4.34-8.58,9.83l.85,278.17,177.49,2V191.42C380.55,185.94,376.75,181.57,372.12,181.59Z"
																		fill="#a76fe2"
																		stroke="#323c44"
																		strokeMiterlimit="10"
																		strokeWidth="14"
																	/>
																	<path
																		d="M347.55,261.85H332.22c-3.73,0-6.76-3.58-6.76-8v-35.2c0-4.42,3-8,6.76-8h15.33c3.73,0,6.76,3.58,6.76,8v35.2C354.31,258.27,351.28,261.85,347.55,261.85Z"
																		fill="#ffdc67"
																	/>
																	<path
																		d="M249.73,183.76h28.85v274.8H249.73Z"
																		fill="#323c44"
																	/>
																</g>
															</g>
															<g id="wallet">
																<path
																	d="M478,288.23h-337A28.93,28.93,0,0,0,112,317.14V546.2a29,29,0,0,0,28.94,28.95H478a29,29,0,0,0,28.95-28.94h0v-229A29,29,0,0,0,478,288.23Z"
																	fill="#a4bdc1"
																	stroke="#323c44"
																	strokeMiterlimit="10"
																	strokeWidth="14"
																/>
																<path
																	d="M512.83,382.71H416.71a28.93,28.93,0,0,0-28.95,28.94h0V467.8a29,29,0,0,0,28.95,28.95h96.12a19.31,19.31,0,0,0,19.3-19.3V402a19.3,19.3,0,0,0-19.3-19.3Z"
																	fill="#a4bdc1"
																	stroke="#323c44"
																	strokeMiterlimit="10"
																	strokeWidth="14"
																/>
																<path
																	d="M451.46,435.79v7.88a14.48,14.48,0,1,1-29,0v-7.9a14.48,14.48,0,0,1,29,0Z"
																	fill="#a4bdc1"
																	stroke="#323c44"
																	strokeMiterlimit="10"
																	strokeWidth="14"
																/>
																<path
																	d="M147.87,541.93V320.84c-.05-13.2,8.25-21.51,21.62-24.27a42.71,42.71,0,0,1,7.14-1.32l-29.36-.63a67.77,67.77,0,0,0-9.13.45c-13.37,2.75-20.32,12.57-20.27,25.77l.38,221.24c-1.57,15.44,8.15,27.08,25.34,26.1l33-.19c-15.9,0-28.78-10.58-28.76-25.93Z"
																	fill="#7b8f91"
																/>
																<path
																	d="M148.16,343.22a6,6,0,0,0-6,6v92a6,6,0,0,0,12,0v-92A6,6,0,0,0,148.16,343.22Z"
																	fill="#323c44"
																/>
															</g>
														</svg>
													</button>
												</form>
											</div>
										</>
									) : null}
								</div>
							) : null}
						</div>
					</div>
					<div className="col-md-4 col-12">
						<div className="card border-primary mb-3 orderingcard2 ">
							<div className="piechartimg">
								<PieChart chartData={userData} />
							</div>
							<div className="row marcopercentsrow ">
								<div className="col-md-4 d-flex justify-content-center">
									<p className="macropercentstyle">
										<span className="macrospancarb"> Carbs</span>{" "}
										{macroNumbers ? macroNumbers.carbs : 0}%
									</p>
								</div>
								<div className="col-md-4 d-flex justify-content-center">
									<p className="macropercentstyle">
										<span className="macrospanfat">Fats</span>{" "}
										{macroNumbers ? macroNumbers.fats : 0}%
									</p>
								</div>
								<div className="col-md-4 d-flex justify-content-center">
									<p className="macropercentstyle">
										<span className="macrospanproteins">Proteins</span>{" "}
										{macroNumbers ? macroNumbers.proteins : 0}%
									</p>
								</div>
							</div>
							<button
								className="adjustbtn"
								onClick={() => props.setOrdersetter(0)}
							>
								Adjust Nutrition Targets
							</button>
						</div>
						{viewingFood && (
							<div className="card border-primary mb-3 orderingcard3 ">
								<p className="calorieLabel">total Calories</p>
								<p className="calorieTotalCard">{getCalorieTotals()}</p>
							</div>
						)}
					</div>
				</div>
			</div>

			{/* <Modal
        isOpen={modalFoodDetails}
        style={customStyles}
        onRequestClose={closeModal}
      >
        <div className="card border-primary mb-3 checkoutcard ">
          <div className="checkouthead">
            <h1 className="fooddetails">
              {foodDetails ? foodDetails.name : null}
            </h1>
          </div>
          <hr></hr>

          {foodDetails != null ? (
            <>
              <div>
                <img className="foodpicture2" src={foodDetails.thumbnail_url} />
              </div>
              <div className="row">
                <div className="col-4 foodbreakdown foodItem">Item</div>
                <div className="col-3 foodbreakdown">Weight</div>
                <div className="col-3 foodbreakdown">Calories</div>
              </div>
              {foodDetails.ingredients != null
                ? foodDetails.ingredients.data.map((ingredient) => (
                    <div key={ingredient.name} className="row fooddetailtext">
                      <div className="col-5">{ingredient.name}</div>

                      <div className="col-3">
                        {weightCalc(ingredient.macro)}

                        {ingredient.unit}
                      </div>
                      <div className="col-2">
                        {calorieCalc(ingredient.macro)}
                      </div>
                    </div>
                  ))
                : null}
              <button className="button button-margin">
                <span className="button__text">
                  <span>O</span>
                  <span>r</span>
                  <span>d</span>
                  <span>e</span>
                  <span>r</span>
                  <span> </span>
                  <span>n</span>
                  <span>o</span>
                  <span>w</span>
                </span>

                <svg
                  className="button__svg"
                  role="presentational"
                  viewBox="0 0 600 600"
                >
                  <defs>
                    <clipPath id="myClip">
                      <rect x="0" y="0" width="100%" height="50%" />
                    </clipPath>
                  </defs>
                  <g clipPath="url(#myClip)">
                    <g id="money">
                      <path
                        d="M441.9,116.54h-162c-4.66,0-8.49,4.34-8.62,9.83l.85,278.17,178.37,2V126.37C450.38,120.89,446.56,116.52,441.9,116.54Z"
                        fill="#699e64"
                        stroke="#323c44"
                        strokeMiterlimit="10"
                        strokeWidth="14"
                      />
                      <path
                        d="M424.73,165.49c-10-2.53-17.38-12-17.68-24H316.44c-.09,11.58-7,21.53-16.62,23.94-3.24.92-5.54,4.29-5.62,8.21V376.54H430.1V173.71C430.15,169.83,427.93,166.43,424.73,165.49Z"
                        fill="#699e64"
                        stroke="#323c44"
                        strokeMiterlimit="10"
                        strokeWidth="14"
                      />
                    </g>
                    <g id="creditcard">
                      <path
                        d="M372.12,181.59H210.9c-4.64,0-8.45,4.34-8.58,9.83l.85,278.17,177.49,2V191.42C380.55,185.94,376.75,181.57,372.12,181.59Z"
                        fill="#a76fe2"
                        stroke="#323c44"
                        strokeMiterlimit="10"
                        strokeWidth="14"
                      />
                      <path
                        d="M347.55,261.85H332.22c-3.73,0-6.76-3.58-6.76-8v-35.2c0-4.42,3-8,6.76-8h15.33c3.73,0,6.76,3.58,6.76,8v35.2C354.31,258.27,351.28,261.85,347.55,261.85Z"
                        fill="#ffdc67"
                      />
                      <path
                        d="M249.73,183.76h28.85v274.8H249.73Z"
                        fill="#323c44"
                      />
                    </g>
                  </g>
                  <g id="wallet">
                    <path
                      d="M478,288.23h-337A28.93,28.93,0,0,0,112,317.14V546.2a29,29,0,0,0,28.94,28.95H478a29,29,0,0,0,28.95-28.94h0v-229A29,29,0,0,0,478,288.23Z"
                      fill="#a4bdc1"
                      stroke="#323c44"
                      strokeMiterlimit="10"
                      strokeWidth="14"
                    />
                    <path
                      d="M512.83,382.71H416.71a28.93,28.93,0,0,0-28.95,28.94h0V467.8a29,29,0,0,0,28.95,28.95h96.12a19.31,19.31,0,0,0,19.3-19.3V402a19.3,19.3,0,0,0-19.3-19.3Z"
                      fill="#a4bdc1"
                      stroke="#323c44"
                      strokeMiterlimit="10"
                      strokeWidth="14"
                    />
                    <path
                      d="M451.46,435.79v7.88a14.48,14.48,0,1,1-29,0v-7.9a14.48,14.48,0,0,1,29,0Z"
                      fill="#a4bdc1"
                      stroke="#323c44"
                      strokeMiterlimit="10"
                      strokeWidth="14"
                    />
                    <path
                      d="M147.87,541.93V320.84c-.05-13.2,8.25-21.51,21.62-24.27a42.71,42.71,0,0,1,7.14-1.32l-29.36-.63a67.77,67.77,0,0,0-9.13.45c-13.37,2.75-20.32,12.57-20.27,25.77l.38,221.24c-1.57,15.44,8.15,27.08,25.34,26.1l33-.19c-15.9,0-28.78-10.58-28.76-25.93Z"
                      fill="#7b8f91"
                    />
                    <path
                      d="M148.16,343.22a6,6,0,0,0-6,6v92a6,6,0,0,0,12,0v-92A6,6,0,0,0,148.16,343.22Z"
                      fill="#323c44"
                    />
                  </g>
                </svg>
              </button>
            </>
          ) : null}
        </div>
      </Modal> */}
		</>
	);
}

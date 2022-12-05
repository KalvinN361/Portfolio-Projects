import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Image from "next/image";

export default function Test1(props) {
	const [calories, setCalories] = useState(0);

	const [carbs, setCarbs] = useState(0);

	const [fats, setFats] = useState(0);

	const [proteins, setProteins] = useState(0);

	const [savedState, setSavedState] = useState({});

	// set the state if the user has already entered the values
	useEffect(() => {
		console.log(Object.keys(props.getMacroInfo()).length > 0);
		if (
			Object.keys(savedState).length == 0 &&
			Object.keys(props.getMacroInfo()).length > 0
		) {
			const macroinfo = props.getMacroInfo();
			setSavedState(macroinfo);
			console.log(macroinfo["calories"]);
			setCalories(macroinfo["calories"]);
			setCarbs(macroinfo["carbs"]);
			setFats(macroinfo["fats"]);
			setProteins(macroinfo["proteins"]);
		}
	}, [props.orderStep]);
	function getcalorievalue(e) {
		if (e.target.value > 2000) {
			toast.error("Please enter a value less than 2000");
		} else {
			setCalories(e.target.value);
		}
	}

	function getcarbvalue(e) {
		if (parseInt(e.target.value) + parseInt(fats) + parseInt(proteins) > 100) {
			toast.error("Total Macro Percent cannot be greater than 100");
			setCarbs(100 - (parseInt(fats) + parseInt(proteins)));
		} else {
			setCarbs(e.target.value);
		}
	}

	function getfatvalue(e) {
		if (parseInt(e.target.value) + parseInt(carbs) + parseInt(proteins) > 100) {
			toast.error("Total Macro Percent cannot be greater than 100");
			setFats(100 - (parseInt(carbs) + parseInt(proteins)));
		} else {
			setFats(e.target.value);
		}
	}

	function getproteinvalue(e) {
		if (parseInt(e.target.value) + parseInt(carbs) + parseInt(fats) > 100) {
			toast.error("Total Macro Percent cannot be greater than 100");
			setProteins(100 - (parseInt(carbs) + parseInt(fats)));
		} else {
			setProteins(e.target.value);
		}
	}

	function macroSubmit() {
		if (calories == 0) {
			toast.error("Please Enter Calories");
		} else if (carbs == null || carbs == 0) {
			toast.error("Please Enter Carbs");
		} else if (fats == null || fats == 0) {
			toast.error("Please Enter Fats");
		} else if (proteins == null || proteins == 0) {
			toast.error("Please Enter Proteins");
		} else if (parseInt(carbs) + parseInt(fats) + parseInt(proteins) != 100) {
			toast.error("Total Macro Percent should be 100");
		} else if (calories < 500) {
			toast.error("Please Enter Calories greater than 500");
		} else {
			props.setOrdersetter(1);
			const equationCalorieData = {
				carbs: parseInt(calories * (carbs / 100)),
				fats: parseInt(calories * (fats / 100)),
				proteins: parseInt(calories * (proteins / 100)),
			};
			props.calorieDataSetter(equationCalorieData);
			props.weightDataSetter({
				carbs: parseInt(equationCalorieData.carbs / 4),
				fats: parseInt(equationCalorieData.fats / 9),
				proteins: parseInt(equationCalorieData.proteins / 4),
			}),
				props.setMacroinfosetter({
					calories: parseInt(calories),
					carbs: parseInt(carbs),
					fats: parseInt(fats),
					proteins: parseInt(proteins),
				});
		}
	}

	return (
		<div>
			<div className="col-md-12 col-12 testcarddiv1">
				<div className="card border-primary mb-3 testcard1 ">
					<div className="form-card-header ">
						<h1 className="macrogoalstxt">Meal Macro Goals</h1>
					</div>
					{/* <hr></hr> */}
					<div className="row">
						<div className="col-md-12 col-12 d-flex justify-content-center">
							{/* <p className="macro-para inputtextstyle">
                Please enter your desired calories and Macro percent split
              </p> */}
						</div>
					</div>

					<div className="row">
						<div className="col-md-12 col-12 calorie-number d-flex justify-content-center">
							<label className="calorielabel">
								<p className="inputtextstyle totaltxtstyle">Calories</p>
								<input
									className="calorie-macro-input"
									type="number"
									placeholder="0"
									onChange={getcalorievalue}
									value={calories}
								></input>
								<p className="inputtextstyle kcaltxtstyle"> kcal</p>
							</label>
						</div>
					</div>

					<div className="row macro-row-holder">
						<div className="col-md-4 col-4 d-flex justify-content-center ">
							<label className="macrolabel macrolabelcarbs">
								<button
									className="increaseBtn"
									onClick={() => {
										if (carbs < 100) {
											// add five to carbs as long as all the macros are less than 100
											if (
												parseInt(carbs) + parseInt(fats) + parseInt(proteins) <
												100
											) {
												setCarbs(
													Math.min(
														parseInt(carbs) + 5,
														100 - (parseInt(fats) + parseInt(proteins))
													)
												);
												// setCarbs(parseInt(carbs) + 5);
											}
										}
									}}
								>
									<Image src="/images/uparrow.png" width="20" height="20" />
								</button>

								<input
									className="macro-input"
									step="5"
									min="0"
									max="100"
									type="number"
									placeholder="0"
									onChange={getcarbvalue}
									value={carbs}
								></input>
								<p className="inputtextstyle">Carbs %</p>
								<button
									className="decreaseBtn"
									onClick={() => {
										// subtract five from carbs as long as carbs is greater than 0
										if (carbs > 0) {
											setCarbs(Math.max(parseInt(carbs) - 5, 0));
										}
									}}
								>
									<Image
										className="decreaseBtnIcon"
										src="/images/downarrow.png"
										width="20"
										height="20"
									/>
								</button>
							</label>
						</div>
						<div className="col-md-4 col-4 d-flex justify-content-center">
							<label className="macrolabel">
								<button
									className="increaseBtn"
									onClick={() => {
										if (fats < 100) {
											// add five to fats as long as all the macros are less than 100
											if (
												parseInt(carbs) + parseInt(fats) + parseInt(proteins) <
												100
											) {
												setFats(
													Math.min(
														parseInt(fats) + 5,
														100 - (parseInt(carbs) + parseInt(proteins))
													)
												);
											}
										}
									}}
								>
									<Image src="/images/uparrow.png" width="20" height="20" />
								</button>
								<input
									className="macro-input"
									step="5"
									min="0"
									max="100"
									type="number"
									placeholder="0"
									onChange={getfatvalue}
									value={fats}
								></input>
								<p className="inputtextstyle">Fats %</p>
								<button
									className="decreaseBtn"
									onClick={() => {
										// subtract five from fats as long as fats is greater than 0
										if (fats > 0) {
											setFats(Math.max(parseInt(fats) - 5, 0));
										}
									}}
								>
									<Image
										className="decreaseBtnIcon"
										src="/images/downarrow.png"
										width="20"
										height="20"
									/>
								</button>
							</label>
						</div>
						<div className="col-md-4 col-4 d-flex justify-content-center ">
							<label className="macrolabel macrolabel">
								<button
									className="increaseBtn"
									onClick={() => {
										if (proteins < 100) {
											// add five to proteins as long as all the macros are less than 100
											if (
												parseInt(carbs) + parseInt(fats) + parseInt(proteins) <
												100
											) {
												setProteins(
													Math.min(
														parseInt(proteins) + 5,
														100 - (parseInt(carbs) + parseInt(fats))
													)
												);
											}
										}
									}}
								>
									<Image src="/images/uparrow.png" width="20" height="20" />
								</button>
								<input
									className="macro-input macro-input-protein"
									step="5"
									min="0"
									max="100"
									type="number"
									placeholder="0"
									onChange={getproteinvalue}
									value={proteins}
								></input>
								<p className="inputtextstyle">Proteins %</p>
								<button
									className="decreaseBtn"
									onClick={() => {
										// subtract five from proteins as long as proteins is greater than 0
										if (proteins > 0) {
											setProteins(Math.max(parseInt(proteins) - 5, 0));
										}
									}}
								>
									<Image
										className="decreaseBtnIcon"
										src="/images/downarrow.png"
										width="20"
										height="20"
									/>
								</button>
							</label>
						</div>
					</div>
					<div className="row">
						<div className="col-md-12 col-12">
							<button
								className="calorie-submit-button d-flex justify-content-center"
								onClick={() => {
									macroSubmit();
								}}
							>
								Submit Macros
							</button>
						</div>
					</div>
					<div className="row undersbmtmacro">
						<div className="col-md-12 col-12">
							<h1 className="formula-header">Our formula makes your meal </h1>
						</div>
						<div className="col-md-6 col-12 ">
							<p className="formula-text">
								Upon submitting your macros our algorithim will create meal
								options based on your desired choices.
							</p>
						</div>
						{/* <div className="col-md-6 col-12 imgcontainer">
                <img src="../../images/imgpiechart.png" alt=""></img>
              </div> */}
					</div>
				</div>
			</div>
		</div>
	);
}

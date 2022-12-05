import Navbar from "../components/Navbar";
import Head from "next/head";
import styles from "../styles/Order.module.css";
import OrderComp from "../components/Ordering";
import React, { useState, useEffect } from "react";
import Test1 from "../components/test1";

export default function Order() {
  const [orderstep, setOrderstep] = useState(0);

  function setOrdersetter(orderstep) {
    setOrderstep(orderstep);
  }

  const [macroinfo, setMacroinfo] = useState([]);

  function setMacroinfosetter(macroinfo) {
    setMacroinfo(macroinfo);
  }

  function getMacroInfo() {
    return macroinfo;
  }

  const [calorieData, setCalorieData] = useState(null);
  const [weightData, setWeightData] = useState(null);

  function weightDataSetter(weightData) {
    setWeightData(weightData);
  }

  function calorieDataSetter(totalcalorie) {
    setCalorieData(totalcalorie);
  }

  function getCalorieData() {
    return calorieData;
  }

  function getWeightData() {
    return weightData;
  }

  return (
    <div>
      <Head>
        <title>Order Page</title>
        <meta name="description" content="Order website Page" />
        <link rel="icon" href="" />
      </Head>
      <div className={styles.nav}>
        <Navbar />
      </div>
      <hr className="divider-order-line"></hr>
      <div className="row aboutus-style">
        <div className="col-11 col-md-8">
          {/* <h1 className={styles.headertext}>Create Your Order Now</h1> */}
        </div>
      </div>
      <div className="row">
        {orderstep == 0 && (
          <Test1
            setOrdersetter={setOrdersetter}
            setMacroinfosetter={setMacroinfosetter}
            getMacroInfo={getMacroInfo}
            calorieDataSetter={calorieDataSetter}
            weightDataSetter={weightDataSetter}
            orderStep={orderstep}
          />
        )}

        {orderstep == 1 && (
          <OrderComp
            getMacroInfo={getMacroInfo}
            setOrdersetter={setOrdersetter}
            getCalorieData={getCalorieData}
            getWeightData={getWeightData}
            calorieDataSetter={calorieDataSetter}
            weightDataSetter={weightDataSetter}
          />
        )}
      </div>
    </div>
  );
}

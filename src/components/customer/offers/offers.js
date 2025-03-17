import React, { useState, useEffect, forwardRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Carousel.css";
import mcd from "./mcd.png";
import kfc from "./kfc.jpg";
import dom from "./dominos.jpg";
import phut from "./pizzahut.jpg";


const items = [
  mcd,
  kfc,
  dom,
  phut
];


const Carousel = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? items.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === items.length - 1 ? 0 : prevIndex + 1));
  };

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 4500);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <div className="carousel-container">
      <div className="carousel-wrapper">
        <motion.div
          className="carousel-inner"
          animate={{ x: `-${currentIndex * 100}%` }}
          transition={{ duration: 0.5 }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="carousel-item"
              style={{ backgroundImage: `url(${item})` }}
            ></div>
          ))}
        </motion.div>
      </div>
      <button onClick={handlePrev} className="carousel-button carousel-button-left">
        <ChevronLeft size={24} />
      </button>
      <button onClick={handleNext} className="carousel-button carousel-button-right">
        <ChevronRight size={24} />
      </button>
      <br/>
    </div>
    
  );
};

const Offers = forwardRef((props, ref) => {
  return (
    <>
    <section ref={ref}>
      <Carousel items={items} />
    </section>
    </>
    
  );
});

export default Offers;

import React from 'react';
import './food.css';

function Food({ anyToggle, setAnyToggle }) {
  function toggleCategory(category) {
    setAnyToggle((prevState) => {
      const newState = {
        pizzaToggle: false,
        pastaToggle: false,
        burgerToggle: false,
        rollsToggle: false,
        shakeToggle: false,
        chineseToggle: false,
      };

      newState[category] = !prevState[category];
      return newState;
    });
  }

  return (
    <>
      <h1 style={{ marginLeft: 100 }}>What's on your mind?</h1>

      <div
        className="rest-parent-cont"
        style={{ width: '100%', justifyContent: 'center', display: 'flex' }}
      >
        <div className="rest-card-container" style={{ display: 'flex', flexWrap: 'wrap' }}>
          <img
            className="zoom"
            onClick={() => toggleCategory('pizzaToggle')}
            src={require('./pizza.avif')}
            width={180}
            height={225}
            alt="Pizza"
          />
          <img
            className="zoom"
            onClick={() => toggleCategory('pastaToggle')}
            src={require('./pasta.avif')}
            width={200}
            height={250}
            alt="Pasta"
          />
          <img
            className="zoom"
            onClick={() => toggleCategory('burgerToggle')}
            src={require('./burger.avif')}
            width={200}
            height={250}
            alt="Burger"
          />
          <img
            className="zoom"
            onClick={() => toggleCategory('rollsToggle')}
            src={require('./rolls.avif')}
            width={200}
            height={250}
            alt="Rolls"
          />
          <img
            className="zoom"
            onClick={() => toggleCategory('shakeToggle')}
            src={require('./shake.avif')}
            width={200}
            height={250}
            alt="Shake"
          />
          <img
            className="zoom"
            onClick={() => toggleCategory('chineseToggle')}
            src={require('./chinese.avif')}
            width={200}
            height={250}
            alt="Chinese"
          />
        </div>
      </div>
      <br />
    </>
  );
}

export default Food;

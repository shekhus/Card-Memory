import { useSpring, animated } from "@react-spring/web";
import PropTypes from "prop-types";
import { styled } from "@mui/system";
import { Box } from "@mui/material";

// Recreate the styled components for testing
const CardContainer = styled(Box)({
    perspective: "1000px",
    cursor: "pointer",
    width: "220px",
    height: "220px",
});

const CardInner = styled(animated.div)({
    position: "relative",
    width: "100%",
    height: "100%",
    transformStyle: "preserve-3d",
    transition: "transform 0.6s",
});

const CardFront = styled(Box)({
    position: "absolute",
    top: 0,
    left: 0,
    width: "80%",
    height: "80%",
    backfaceVisibility: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    transform: "rotateY(180deg)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
});

const CardBack = styled(Box)({
    position: "absolute",
    top: 0,
    left: 0,
    width: "90%",
    height: "90%",
    backfaceVisibility: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "8px",
    transform: "rotateY(0deg)",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
});

// Extracted Card component from MemoryEasy.jsx for testing
export const Card = ({ card, handleClick, flipped, matched }) => {
    const { transform } = useSpring({
        transform: flipped || matched ? "rotateY(180deg)" : "rotateY(0deg)",
        config: { tension: 500, friction: 30 },
    });

    return (
        <CardContainer onClick={handleClick} data-testid="card-container">
            <CardInner style={{ transform }}>
                <CardFront data-testid="card-front">
                    <img src={card.image} alt="Card front" style={{ width: "140%", height: "140%" }} />
                </CardFront>
                <CardBack data-testid="card-back">
                    <img src="/images/Back2.png" alt="Card back" style={{ width: "120%", height: "120%" }} />
                </CardBack>
            </CardInner>
        </CardContainer>
    );
};

Card.propTypes = {
    card: PropTypes.shape({
        id: PropTypes.number.isRequired,
        image: PropTypes.string.isRequired,
    }).isRequired,
    handleClick: PropTypes.func.isRequired,
    flipped: PropTypes.bool.isRequired,
    matched: PropTypes.bool.isRequired,
}; 
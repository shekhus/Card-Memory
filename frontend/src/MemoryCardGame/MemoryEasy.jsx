import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid, Button, Modal, Typography } from "@mui/material";
import { styled } from "@mui/system";
import PropTypes from "prop-types";
import { useSpring, animated } from "@react-spring/web";
import background from "../assets/images/mode1.gif";
import bgMusic from "../assets/audio/memory-bg.mp3";
import axios from "axios";
import { shuffleArray, cardStateHelpers } from "./CardUtils";

const defaultDifficulty = "Easy";

// Card Images
const cardImages = [
    { id: 1, image: "/images/meteor.png" },
    { id: 2, image: "/images/meteor.png" },
    { id: 3, image: "/images/comet.png" },
    { id: 4, image: "/images/comet.png" },
  ];

// Audio files for matching and final congratulation
const matchAudioFiles = [
  "/audio/wonderful.mp3",

];

const congratsAudio = "/audio/congrats.mp3"; // Final congratulations audio

const saveGameData = async (gameData) => {
  try {
    const response = await axios.post("http://localhost:5005/api/memory/save", gameData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("Game data saved successfully", response.data);
  } catch (error) {
    console.error("Error saving game data:", error.response ? error.response.data : error.message);
  }
};

// Styled Components
const StyledGameContainer = styled(Box)(({ mouseDisabled }) => ({
  minHeight: "100vh",
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  backgroundImage: `url(${background})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative",
  pointerEvents: mouseDisabled ? "none" : "auto",
}));

const PixelButton = styled(Box)(() => ({
  display: "inline-block",
  backgroundColor: "#2c2c54",
  color: "#fff",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "14px",
  padding: "15px 30px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",

  "&:hover": {
    backgroundColor: "#40407a",
    borderColor: "#00aaff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
}));

const PixelBox = styled(Box)(() => ({
  position: "absolute",
  bottom: "10%",
  left: "1%",
  backgroundColor: "#ff4d4f",
  color: "#fff",
  padding: "10px 20px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "12px",
  textAlign: "center",
  marginBottom: "10px",
}));

const PixelTimerBox = styled(Box)(() => ({
  position: "absolute",
  bottom: "5%",
  left: "1%",
  backgroundColor: "#2c2c54",
  color: "#fff",
  padding: "10px 20px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
  fontFamily: '"Press Start 2P", cursive',
  fontSize: "12px",
  textAlign: "center",
}));

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
  // backgroundColor: "#1b1f34",
  // border: "2px solid #4c5c77",
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
  // backgroundColor: "#2c2c54",
  // border: "2px solid #00aaff",
  borderRadius: "8px",
  transform: "rotateY(0deg)",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)",
});


const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: '#2c2c54',  // Matching the game's background color
  border: '2px solid #00d9ff', // Matching the pixel border
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.5)", // Subtle shadow for pixel look
  padding: '20px',
  textAlign: 'center',
  borderRadius: '10px', // Pixel rounded corners
};

const PixelTypography = styled(Typography)(() => ({
  fontFamily: '"Press Start 2P", cursive', // Pixelated font style
  fontSize: '24px',
  color: '#fff',  // White text to stand out on the background
  letterSpacing: '1px',
  textShadow: `
    -1px -1px 0 #ff0000,
    1px -1px 0 #ff7f00,
    1px 1px 0 #ffd700,
    -1px 1px 0 #ff4500`,  // Pixelated text shadow
}));

const PixelButtonModal = styled(Button)(() => ({
  backgroundColor: "#2c2c54",
  color: "#fff",
  fontFamily: '"Press Start 2P", cursive', // Pixelated font style
  fontSize: "14px",
  padding: "15px 30px",
  border: "2px solid #00d9ff",
  borderRadius: "8px",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  cursor: "pointer",
  textAlign: "center",
  transition: "transform 0.2s, background-color 0.2s, box-shadow 0.2s",
  "&:hover": {
    backgroundColor: "#40407a",
    borderColor: "#00aaff",
    boxShadow: "0 6px 12px rgba(0, 0, 0, 0.4)",
  },
  "&:active": {
    transform: "scale(0.95)",
  },
}));

// Card Component
const Card = ({ card, handleClick, flipped, matched }) => {
  const { transform } = useSpring({
    transform: flipped || matched ? "rotateY(180deg)" : "rotateY(0deg)",
    config: { tension: 500, friction: 30 },
  });

  return (
    <CardContainer onClick={handleClick}>
      <CardInner style={{ transform }}>
        <CardFront>
          <img src={card.image} alt="Card front" style={{ width: "140%", height: "140%" }} />
        </CardFront>
        <CardBack>
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

const  MemoryEasy = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [initialReveal, setInitialReveal] = useState(true);
  const [musicStarted, setMusicStarted] = useState(false);
  const [mouseDisabled, setMouseDisabled] = useState(false);
  const [bgVolume] = useState(parseInt(localStorage.getItem("bgVolume"), 10) || 0);
  const [sfxVolume] = useState(parseInt(localStorage.getItem("sfxVolume"), 10) || 0);
  const audioRef = useRef(null);
  const [audioIndex, setAudioIndex] = useState(0);
  const [openModal, setOpenModal] = useState(false);

  const userID = localStorage.getItem("userID");
  
  // Move hooks before any conditionals to avoid React Hook errors
  // Memoize the shuffled cards to avoid unnecessary re-renders
  const shuffleCards = useCallback(() => {
    return shuffleArray(cardImages);
  }, []);

  const handleSaveNewGame = useCallback(() => {
    if (!userID) return;
    
    saveGameData({
      userID,
      gameDate: new Date(),
      failed: failedAttempts,
      difficulty: defaultDifficulty,
      completed: 0,
      timeTaken: timer,
    });
  }, [failedAttempts, timer, userID]);

  const handleNewGame = useCallback(() => {
    setCards(shuffleCards());
    setMatchedCards([]);
    setFlippedCards([]);
    setFailedAttempts(0);
    setTimer(0);
    setTimerActive(false);
    setInitialReveal(true);
    setAudioIndex(0); // Reset audio index

    const mouseDisableDuration = 2000;
    setMouseDisabled(true);
    setTimeout(() => {
      setMouseDisabled(false);  // Re-enable mouse events after mouseDisableDuration
    }, mouseDisableDuration);

    setTimeout(() => {
      setInitialReveal(false);
      setTimerActive(true);
    }, 1500);
  }, [shuffleCards]);

  const handleBackButton = () => {
    setOpenModal(true); // Show the confirmation modal
  };

  const handleModalYes = () => {
    setOpenModal(false);
    localStorage.removeItem("gameCompleted"); // Remove game completion flag
    navigate("/play"); // Navigate to play
  };

  const handleModalNo = () => {
    setOpenModal(false); // Close the modal and resume game
  };

  useEffect(() => {
    handleNewGame();
    const handleFirstClick = () => {
      if (!musicStarted && audioRef.current) {
        audioRef.current.volume = bgVolume / 100;
        audioRef.current.play().catch((error) => console.error("Audio play error:", error));
        setMusicStarted(true);
      }
    };
    document.addEventListener("click", handleFirstClick);

    return () => document.removeEventListener("click", handleFirstClick);
  }, []);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setTimer((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  // Optimized useEffect for checking matched cards
  useEffect(() => {
    if (flippedCards.length === 2) {
      const [card1, card2] = flippedCards;
      
      // Use a single timeout for better performance
      const timeoutId = setTimeout(() => {
        if (card1.image === card2.image) {
          // Update matched cards
          setMatchedCards((prev) => [...prev, card1.id, card2.id]);
          
          // Play audio if available
          if (audioIndex < matchAudioFiles.length) {
            const nextAudio = new Audio(matchAudioFiles[audioIndex]);
            nextAudio.volume = sfxVolume / 100;
            nextAudio.play().catch(error => console.error("Audio play error:", error));
            setAudioIndex(audioIndex + 1);
          }
        } else {
          setFailedAttempts((prev) => prev + 1);
        }
        
        // Clear flipped cards
        setFlippedCards([]);
      }, 1000);
      
      // Cleanup timeout on component unmount or when dependencies change
      return () => clearTimeout(timeoutId);
    }
  }, [flippedCards, audioIndex, sfxVolume]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
        // Play the congratulations audio
        const congrats = new Audio(congratsAudio);
        congrats.volume = sfxVolume / 100;
        congrats.play();

        // Stop the timer before saving the game data
        setTimerActive(false);

        // Ensure the game data is saved only once
        const saveData = async () => {
            try {
                await saveGameData({
                    userID,
                    gameDate: new Date(),
                    failed: failedAttempts,
                    difficulty: defaultDifficulty,
                    completed: 1,
                    timeTaken: timer,
                });
                localStorage.setItem("gameCompleted", "true");
                setTimeout(() => navigate("/congt-easy"), 1000);
            } catch (error) {
                console.error("Error saving game data:", error);
            }
        };

        saveData();
    }
}, [matchedCards, cards.length, navigate, sfxVolume, failedAttempts, timer]);

  // Optimized card click handler using the utility functions
  const handleCardClick = useCallback((card) => {
    setFlippedCards(currentFlipped => 
      cardStateHelpers.addFlippedCard(card, currentFlipped, matchedCards)
    );
  }, [matchedCards]);

  // Memoize the grid component to avoid unnecessary re-renders
  const cardGrid = useMemo(() => (
    <Grid container spacing={6} justifyContent="center" sx={{ maxWidth: 600, marginTop: "-80px" }}>
      {cards.map((card) => (
        <Grid item xs={6} key={card.id}>
          <Card
            card={card}
            handleClick={() => handleCardClick(card)}
            flipped={
              initialReveal ||
              flippedCards.some((c) => c.id === card.id) ||
              matchedCards.includes(card.id)
            }
            matched={matchedCards.includes(card.id)}
          />
        </Grid>
      ))}
    </Grid>
  ), [cards, handleCardClick, initialReveal, flippedCards, matchedCards]);

  if (!userID) {
    console.error("Error: userID is missing.");
    return <div>Please log in to play the game.</div>;
  }

  return (
    <StyledGameContainer mouseDisabled={mouseDisabled}>
      <audio ref={audioRef} src={bgMusic} loop />
      <PixelButton onClick={handleBackButton} sx={{ alignSelf: "flex-start", margin: 2 }}>
        Back
      </PixelButton>
      <PixelTimerBox>Timer: {timer}s</PixelTimerBox>
      <PixelBox>Learning Moments: {failedAttempts}</PixelBox>
      
      {cardGrid} {/* Use the memoized grid */}
      
      <Box sx={{ mt: 2, textAlign: "center" }}>
        <PixelButton onClick={() => { handleSaveNewGame(); handleNewGame(); }} sx={{ mt: 2}}>
          New Game
        </PixelButton>
      </Box>

      <Modal open={openModal} onClose={handleModalNo}>
  <Box sx={modalStyle}>
    <PixelTypography variant="h6">
      Are you sure you want to go back to the play page?
    </PixelTypography>
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, marginTop: 2 }}>
      <PixelButtonModal onClick={() => { handleSaveNewGame(); handleModalYes(); }} variant="contained" color="primary">
        Yes
      </PixelButtonModal>
      <PixelButtonModal onClick={handleModalNo} variant="contained" color="secondary">
        No
      </PixelButtonModal>
    </Box>
  </Box>
</Modal>
    </StyledGameContainer>
  );
};

export default MemoryEasy;

/**
 * Optimized Fisher-Yates shuffle algorithm with memoization
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
export const shuffleArray = (array) => {
    // Create a copy to avoid mutating the original array
    const shuffledArray = [...array];

    // Fisher-Yates algorithm - more efficient than the previous implementation
    for (let i = shuffledArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    }

    return shuffledArray;
};

/**
 * Check if two cards match
 * @param {Object} card1 - First card
 * @param {Object} card2 - Second card
 * @returns {boolean} - True if cards match
 */
export const cardsMatch = (card1, card2) => {
    if (!card1 || !card2) return false;
    return card1.image === card2.image;
};

/**
 * Optimized functions for card state management
 */
export const cardStateHelpers = {
    // Add a card to the flipped cards array if valid
    addFlippedCard: (card, flippedCards, matchedCardIds) => {
        // Skip if card is already matched or flipped
        if (matchedCardIds.includes(card.id) || flippedCards.some(c => c.id === card.id)) {
            return flippedCards;
        }

        // Only add if we have less than 2 cards flipped
        if (flippedCards.length < 2) {
            return [...flippedCards, card];
        }

        return flippedCards;
    },

    // Check matched cards and return the updated matched cards array
    processMatchedCards: (flippedCards, currentMatchedCardIds) => {
        if (flippedCards.length !== 2) return currentMatchedCardIds;

        const [card1, card2] = flippedCards;
        if (cardsMatch(card1, card2)) {
            return [...currentMatchedCardIds, card1.id, card2.id];
        }

        return currentMatchedCardIds;
    }
};

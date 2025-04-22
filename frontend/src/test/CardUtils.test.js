import { describe, it, expect } from 'vitest';
import { shuffleArray, cardsMatch, cardStateHelpers } from '../MemoryCardGame/CardUtils';

describe('CardUtils', () => {

    // Test data
    const sampleCards = [
        { id: 1, image: '/test1.png' },
        { id: 2, image: '/test2.png' },
        { id: 3, image: '/test1.png' }, // Matching with id: 1
        { id: 4, image: '/test2.png' }  // Matching with id: 2
    ];

    describe('shuffleArray', () => {
        it('should return an array of the same length', () => {
            const result = shuffleArray(sampleCards);
            expect(result.length).toBe(sampleCards.length);
        });

        it('should contain all the same items', () => {
            const result = shuffleArray(sampleCards);
            // Check that all original items exist in the shuffled array
            sampleCards.forEach(card => {
                expect(result.some(r => r.id === card.id)).toBe(true);
            });
        });

        it('should not modify the original array', () => {
            const original = [...sampleCards];
            shuffleArray(sampleCards);
            expect(sampleCards).toEqual(original);
        });

        it('should return a different order at least sometimes', () => {
            // Run shuffle many times to reduce the chance of false positives
            let differentOrderFound = false;

            for (let i = 0; i < 10; i++) {
                const result = shuffleArray(sampleCards);

                // Check if the order is different
                const isDifferent = result.some((card, index) => card.id !== sampleCards[index].id);

                if (isDifferent) {
                    differentOrderFound = true;
                    break;
                }
            }

            expect(differentOrderFound).toBe(true);
        });
    });

    describe('cardsMatch', () => {
        it('should return true for cards with the same image', () => {
            const card1 = sampleCards[0]; // image: '/test1.png'
            const card2 = sampleCards[2]; // image: '/test1.png'
            expect(cardsMatch(card1, card2)).toBe(true);
        });

        it('should return false for cards with different images', () => {
            const card1 = sampleCards[0]; // image: '/test1.png'
            const card2 = sampleCards[1]; // image: '/test2.png'
            expect(cardsMatch(card1, card2)).toBe(false);
        });

        it('should return false if either card is null or undefined', () => {
            const card = sampleCards[0];
            expect(cardsMatch(card, null)).toBe(false);
            expect(cardsMatch(null, card)).toBe(false);
            expect(cardsMatch(undefined, card)).toBe(false);
            expect(cardsMatch(card, undefined)).toBe(false);
        });
    });

    describe('cardStateHelpers.addFlippedCard', () => {
        it('should add a card to empty flipped cards array', () => {
            const card = sampleCards[0];
            const result = cardStateHelpers.addFlippedCard(card, [], []);
            expect(result).toEqual([card]);
        });

        it('should add a second card if there is already one card', () => {
            const card1 = sampleCards[0];
            const card2 = sampleCards[1];
            const result = cardStateHelpers.addFlippedCard(card2, [card1], []);
            expect(result).toEqual([card1, card2]);
        });

        it('should not add a card if it is already matched', () => {
            const card = sampleCards[0];
            const matchedCardIds = [card.id];
            const result = cardStateHelpers.addFlippedCard(card, [], matchedCardIds);
            expect(result).toEqual([]);
        });

        it('should not add a card if it is already flipped', () => {
            const card = sampleCards[0];
            const result = cardStateHelpers.addFlippedCard(card, [card], []);
            expect(result).toEqual([card]);
        });

        it('should not add a card if two cards are already flipped', () => {
            const card1 = sampleCards[0];
            const card2 = sampleCards[1];
            const card3 = sampleCards[2];
            const result = cardStateHelpers.addFlippedCard(card3, [card1, card2], []);
            expect(result).toEqual([card1, card2]);
        });
    });

    describe('cardStateHelpers.processMatchedCards', () => {
        it('should return the same matched cards if flipped cards length is not 2', () => {
            const matchedCardIds = [1, 2];
            const result = cardStateHelpers.processMatchedCards([sampleCards[0]], matchedCardIds);
            expect(result).toEqual(matchedCardIds);
        });

        it('should add card IDs to matched cards when the cards match', () => {
            const card1 = sampleCards[0]; // image: '/test1.png'
            const card2 = sampleCards[2]; // image: '/test1.png'
            const result = cardStateHelpers.processMatchedCards([card1, card2], []);
            expect(result).toEqual([card1.id, card2.id]);
        });

        it('should not add card IDs to matched cards when the cards do not match', () => {
            const card1 = sampleCards[0]; // image: '/test1.png'
            const card2 = sampleCards[1]; // image: '/test2.png'
            const result = cardStateHelpers.processMatchedCards([card1, card2], []);
            expect(result).toEqual([]);
        });

        it('should add new matched card IDs to existing matched cards', () => {
            const card1 = sampleCards[0]; // image: '/test1.png'
            const card2 = sampleCards[2]; // image: '/test1.png'
            const existingMatches = [3, 4];
            const result = cardStateHelpers.processMatchedCards([card1, card2], existingMatches);
            expect(result).toEqual([...existingMatches, card1.id, card2.id]);
        });
    });
}); 
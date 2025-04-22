import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

// Mock the useNavigate hook
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock the CardUtils functions
vi.mock('../MemoryCardGame/CardUtils', () => ({
    shuffleArray: (array) => array, // Return the same array for predictable tests
    cardStateHelpers: {
        addFlippedCard: vi.fn((card, flippedCards, matchedCardIds) => {
            if (matchedCardIds.includes(card.id) || flippedCards.some(c => c.id === card.id)) {
                return flippedCards;
            }
            if (flippedCards.length < 2) {
                return [...flippedCards, card];
            }
            return flippedCards;
        }),
        processMatchedCards: vi.fn((flippedCards, currentMatchedCardIds) => {
            if (flippedCards.length !== 2) return currentMatchedCardIds;
            const [card1, card2] = flippedCards;
            if (card1.image === card2.image) {
                return [...currentMatchedCardIds, card1.id, card2.id];
            }
            return currentMatchedCardIds;
        })
    }
}));

// Mock axios
vi.mock('axios', () => ({
    default: {
        post: vi.fn(() => Promise.resolve({ data: { success: true } }))
    }
}));

// Need to dynamically import MemoryEasy to avoid test errors with audio/images
const importComponent = async () => {
    return (await import('../MemoryCardGame/MemoryEasy')).default;
};

// Mock navigation function
const mockNavigate = vi.fn();

describe('MemoryEasy Component', () => {
    let MemoryEasy;

    beforeEach(async () => {
        vi.clearAllMocks();
        // Reset localStorage mock
        localStorage.getItem.mockImplementation((key) => {
            if (key === 'userID') return 'test-user';
            if (key === 'bgVolume') return '50';
            if (key === 'sfxVolume') return '50';
            return null;
        });

        // Dynamically import the component for each test
        MemoryEasy = await importComponent();
    });

    it('should render the game board', async () => {
        render(
            <MemoryRouter>
                <MemoryEasy />
            </MemoryRouter>
        );

        // Check for game elements
        expect(screen.getByText('Timer: 0s')).toBeInTheDocument();
        expect(screen.getByText('Learning Moments: 0')).toBeInTheDocument();
        expect(screen.getByText('Back')).toBeInTheDocument();
        expect(screen.getByText('New Game')).toBeInTheDocument();
    });

    it('should initialize with cards being revealed', async () => {
        render(
            <MemoryRouter>
                <MemoryEasy />
            </MemoryRouter>
        );

        // In the initial state, cards should be shown (initialReveal = true)
        // We need to wait for the component to render fully
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        // There should be cards rendered
        const cardElements = document.querySelectorAll('[data-testid="card-container"]');
        expect(cardElements.length).toBeGreaterThan(0);
    });

    it('should start a new game when New Game button is clicked', async () => {
        render(
            <MemoryRouter>
                <MemoryEasy />
            </MemoryRouter>
        );

        // Find and click the New Game button
        const newGameButton = screen.getByText('New Game');
        await act(async () => {
            fireEvent.click(newGameButton);
        });

        // Verify the game was reset
        expect(screen.getByText('Timer: 0s')).toBeInTheDocument();
        expect(screen.getByText('Learning Moments: 0')).toBeInTheDocument();
    });

    it('should show the confirmation modal when Back button is clicked', async () => {
        render(
            <MemoryRouter>
                <MemoryEasy />
            </MemoryRouter>
        );

        // Find and click the Back button
        const backButton = screen.getByText('Back');
        await act(async () => {
            fireEvent.click(backButton);
        });

        // Verify the modal is shown
        expect(screen.getByText('Are you sure you want to go back to the play page?')).toBeInTheDocument();
    });

    it('should navigate to play page when Yes is clicked in the modal', async () => {
        render(
            <MemoryRouter>
                <MemoryEasy />
            </MemoryRouter>
        );

        // Open the modal by clicking the Back button
        const backButton = screen.getByText('Back');
        await act(async () => {
            fireEvent.click(backButton);
        });

        // Find and click the Yes button in the modal
        const yesButton = screen.getByText('Yes');
        await act(async () => {
            fireEvent.click(yesButton);
        });

        // Verify navigation happened
        expect(mockNavigate).toHaveBeenCalledWith('/play');
    });
}); 
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Import the Card component
// Note: We need to create a separate testable Card component since 
// the original is embedded in MemoryEasy.jsx
import { Card } from './TestComponents';

describe('Card Component', () => {
    const mockCard = { id: 1, image: '/test-image.png' };
    const mockHandleClick = vi.fn();

    it('should render a card with back side showing by default', () => {
        render(
            <Card
                card={mockCard}
                handleClick={mockHandleClick}
                flipped={false}
                matched={false}
            />
        );

        // Card back should be visible
        const cardBack = screen.getByAltText('Card back');
        expect(cardBack).toBeInTheDocument();
    });

    it('should render the card image when flipped', () => {
        render(
            <Card
                card={mockCard}
                handleClick={mockHandleClick}
                flipped={true}
                matched={false}
            />
        );

        // Card front (image) should be visible
        const cardFront = screen.getByAltText('Card front');
        expect(cardFront).toBeInTheDocument();
        expect(cardFront.src).toContain(mockCard.image);
    });

    it('should call handleClick when clicked', () => {
        render(
            <Card
                card={mockCard}
                handleClick={mockHandleClick}
                flipped={false}
                matched={false}
            />
        );

        // Find the card container and click it
        const cardContainer = screen.getByAltText('Card back').closest('div').parentElement;
        fireEvent.click(cardContainer);

        // The handleClick should have been called
        expect(mockHandleClick).toHaveBeenCalledTimes(1);
    });

    it('should render the card image when matched', () => {
        render(
            <Card
                card={mockCard}
                handleClick={mockHandleClick}
                flipped={false}
                matched={true}
            />
        );

        // Card should be flipped to show the front side
        const cardFront = screen.getByAltText('Card front');
        expect(cardFront).toBeInTheDocument();
    });
}); 
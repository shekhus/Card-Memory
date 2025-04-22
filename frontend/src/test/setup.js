import '@testing-library/jest-dom';
import { vi, beforeEach } from 'vitest';

// Mock Audio constructor since it's not available in jsdom
class MockAudio {
    constructor() {
        this.src = '';
        this.volume = 1;
        this.loop = false;
        this.currentTime = 0;
    }

    play() {
        return Promise.resolve();
    }

    pause() { }
}

// Mock the window.localStorage
const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
};

// Mock navigation
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Setup global mocks
window.Audio = MockAudio;
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Reset mocks between tests
beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockImplementation((key) => {
        if (key === 'userID') return 'test-user';
        if (key === 'bgVolume') return '50';
        if (key === 'sfxVolume') return '50';
        return null;
    });
}); 
import { useEffect, useState } from 'react';
import { useDeckStore } from '../stores/deckStore';
import { useGameStore } from '../stores/gameStore';
import { useCountStore } from '../stores/countStore';

let clickedInitStartedGame = false;
const Deck = () => {
  const deck = useDeckStore(state => state.deck);
  const startGame = useGameStore(state => state.startGame);
  const initDealState = useGameStore(state => state.initDealState);
  const dealerFinalCount = useGameStore(state => state.dealer.finalCount);
  const didGameStart = useGameStore(state => state.didGameStart);
  const didGameEnd = didGameStart && dealerFinalCount > 0;

  const players = useGameStore(state => state.players);
  const areAllPlayersReady = players.every(player => player.ready);

  const [runningCount, getAbsoluteCount] = useCountStore(state => [state.runningCount, state.getAbsoluteCount]);

  const handleStartGame = async () => {
    await startGame();
  };
  const handleDealAnotherRound = () => {
    initDealState();
  };

  useEffect(() => {
    if (!clickedInitStartedGame && !didGameStart && areAllPlayersReady) {
      clickedInitStartedGame = true;
      setTimeout(startGame, 300);
    }
    if (didGameStart) {
      clickedInitStartedGame = false;
    }
  }, [areAllPlayersReady, didGameStart, startGame]);

  return (
    <>
      <div className='flex'>
        <div className='flex flex-col items-center justify-center h-auto w-auto bg-gray-900 text-white p-4 rounded shadow-lg'>
          <p>{deck.length} cards</p>
          <div className='bg-gray-900 text-white p-4 rounded shadow-lg'>
            <p>Running Count: {runningCount}</p>
            <p>Absolute Count: {getAbsoluteCount()}</p>
          </div>

          {!didGameStart && areAllPlayersReady && (
            <button
              disabled={!areAllPlayersReady}
              onClick={handleStartGame}
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                !areAllPlayersReady && 'disabled'
              }`}
            >
              Start Game
            </button>
          )}

          {didGameEnd && (
            <button
              onClick={handleDealAnotherRound}
              className='bg-blue-500 hover:bg-blue-700
       text-white font-bold py-2 px-4 rounded disabled:hover:pointer-events-none disabled:hover'
            >
              Deal Again
            </button>
          )}
        </div>
      </div>
      {!areAllPlayersReady && (
        <h2 className={`bg-orange-800 fixed text-white font-bold py-2 px-4 rounded top-1/4`}>Setup Bets!</h2>
      )}
    </>
  );

  /*
  <div className="flex flex-col items-center justify-center h-full">
      <div className="bg-gray-900 text-white p-4 rounded shadow-lg">
        Deck ({deck.length} cards)
      </div>
    </div>
   */
};

export default Deck;

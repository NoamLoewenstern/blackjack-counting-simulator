import { useEffect, useRef } from 'react';
import { calculateCountingBet } from '~/lib/strategies/blackjack-counting';
import { useRunningCount } from '~/stores/countStore';
import { useAutomationSettingsStore, useSettingsStore } from '~/stores/settingsStore';
import { useGameMachine } from '~/lib/machines/gameMachineContext';
import { calculateBetPerfectBlackjack } from '~/lib/strategies/perfect-blackjack';
import usePlayer from '../hooks/usePlayer';
import usePlayerHand from '../hooks/usePlayerHand';

const useAutomateBetForCountingBots = ({ isReady, setIsReady }: { isReady: boolean; setIsReady: () => void }) => {
  const { send } = useGameMachine();
  const { player } = usePlayerHand();
  const runningCount = useRunningCount(state => state.runningCount);
  const numberDecksInShoe = useSettingsStore(state => state.numberDecksInShoe);

  const {
    isOn: automateInteractivePlayer,
    intervalWaits: { playerAction: playerActionTimeout },
  } = useAutomationSettingsStore();

  const alreadyRanEffect = useRef(false);
  useEffect(() => {
    if (alreadyRanEffect.current || (player.strategy === 'interactive' && !automateInteractivePlayer) || isReady)
      return;
    alreadyRanEffect.current = true;
    const placeBet = (bet: number) => {
      send({
        type: 'PLACE_BET',
        params: {
          playerId: player.id,
          handIdx: 0, // init deal
          bet,
          overrideAction: 'override',
        },
      });
    };
    const bet = {
      'perfect-blackjack': () => calculateBetPerfectBlackjack(),
      counting: () => calculateCountingBet({ runningCount, numberDecksInShoe }),
      // interactive: () => raiseError(`Invalid strategy ${player.strategy}`),
      interactive: () => calculateBetPerfectBlackjack(),
    }[player.strategy]();
    setTimeout(async () => placeBet(bet), playerActionTimeout);
  }, [
    automateInteractivePlayer,
    isReady,
    numberDecksInShoe,
    player.id,
    player.strategy,
    playerActionTimeout,
    runningCount,
    send,
  ]);

  const bet = player.hands[0]!.bet;

  const alreadyRanEffectSetBet = useRef(false);
  useEffect(() => {
    if (alreadyRanEffectSetBet.current || (player.strategy === 'interactive' && !automateInteractivePlayer) || isReady)
      return;
    if (bet > 0) {
      // previously effect set the bet
      alreadyRanEffectSetBet.current = true;
      setIsReady();
    }
  }, [automateInteractivePlayer, bet, isReady, player.strategy, setIsReady]);
};

export default function BetControls() {
  const { send } = useGameMachine();
  const { player } = usePlayer();
  const { hand } = usePlayerHand();
  function handleReady() {
    if (hand.bet === 0) {
      alert('No Bet Placed');
      return;
    }
    send({
      type: 'PLACE_BET',
      params: {
        playerId: player.id,
        handIdx: 0 /* init deal */,
        bet: hand.bet,
        overrideAction: 'override',
        isReady: true,
      },
    });
  }
  function handleResetBet() {
    send({
      type: 'PLACE_BET',
      params: { playerId: player.id, handIdx: 0 /* init deal */, bet: 0, overrideAction: 'override' },
    });
  }
  const disableReady = hand.bet === 0;
  useAutomateBetForCountingBots({ isReady: hand.isReady, setIsReady: handleReady });

  if (hand.isReady) return <h3>Ready</h3>;

  return (
    <div className='flex flex-wrap justify-center gap-4 max-w-[400px] mx-auto'>
      <>
        <BetButton amount={1} />
        <BetButton amount={5} />
        <BetButton amount={10} />
        <BetButton amount={20} />
        <BetButton amount={50} />
        <BetButton amount={100} />
        <button
          onClick={handleReady}
          disabled={disableReady}
          className={`${
            disableReady ? 'disabled' : ''
          } bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mb-2`}
        >
          Ready
        </button>
        <button
          onClick={handleResetBet}
          className={`${
            disableReady ? 'disabled' : ''
          } bg-yellow-800 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded mb-2`}
        >
          Reset
        </button>
      </>
    </div>
  );
}

const BetButton = ({ amount }: { amount: number }) => {
  const { send } = useGameMachine();
  const { player } = usePlayer();

  const handleBet = (betAmount: number) => {
    if (player.balance < betAmount) {
      alert('Not Enough Balance');
      return;
    }
    send({
      type: 'PLACE_BET',
      params: { playerId: player.id, handIdx: 0 /* init deal */, bet: betAmount, overrideAction: 'aggregate' },
    });
  };

  return (
    <button
      onClick={() => handleBet(amount)}
      className='bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-2'
    >
      Bet {amount}
    </button>
  );
};

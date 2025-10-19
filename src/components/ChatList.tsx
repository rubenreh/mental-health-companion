import { useChatStore } from '@/lib/store';
import { PlusIcon, ShareIcon } from '@heroicons/react/24/outline';

export default function ChatList() {
  const { chats, currentChat, setCurrentChat, addChat, toggleSharedMemory } = useChatStore();

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: 'New Chat',
      sharedMemory: false,
      createdAt: Date.now(),
      lastUpdated: Date.now(),
    };
    addChat(newChat);
    setCurrentChat(newChat.id);
  };

  return (
    <div className="w-64 bg-gray-800 text-white h-screen p-4">
      <button
        onClick={createNewChat}
        className="w-full flex items-center justify-center space-x-2 p-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg mb-4"
      >
        <PlusIcon className="h-5 w-5" />
        <span>New Chat</span>
      </button>

      <div className="space-y-2">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className={`p-2 rounded-lg cursor-pointer flex items-center justify-between ${
              currentChat === chat.id ? 'bg-gray-700' : 'hover:bg-gray-700'
            }`}
            onClick={() => setCurrentChat(chat.id)}
          >
            <span className="truncate">{chat.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleSharedMemory(chat.id);
              }}
              className={`p-1 rounded-full ${
                chat.sharedMemory ? 'bg-indigo-600' : 'bg-gray-600'
              }`}
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
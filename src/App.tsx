import { useApiKey } from './hooks/useApiKey';
import { useModels } from './hooks/useModels';
import { useConversations, type ImportedMessage } from './hooks/useConversations';
import { ApiKeyScreen } from './components/ApiKeyScreen';
import { Layout } from './components/Layout';

export default function App() {
  const { apiKey, isKeySet, isValidating, validationError, saveApiKey, clearApiKey } = useApiKey();
  const { models, selectedModel, setSelectedModel, isLoading: modelsLoading } = useModels(apiKey);
  const {
    conversations,
    activeConversationId,
    activeConversation,
    createConversation,
    importConversation,
    selectConversation,
    deleteConversation,
    updateConversation,
    moveConversation,
    moveConversationsToFolder,
  } = useConversations();

  if (!isKeySet) {
    return (
      <ApiKeyScreen
        onKeySaved={() => {}}
        saveApiKey={saveApiKey}
        isValidating={isValidating}
        validationError={validationError}
      />
    );
  }

  return (
    <Layout
      conversations={conversations}
      activeConversationId={activeConversationId}
      activeConversation={activeConversation}
      onSelectConversation={selectConversation}
      onNewChat={(folderId) => createConversation(selectedModel, folderId)}
      onDeleteConversation={deleteConversation}
      onClearKey={clearApiKey}
      models={models}
      selectedModel={selectedModel}
      onSelectModel={setSelectedModel}
      modelsLoading={modelsLoading}
      apiKey={apiKey!}
      updateConversation={updateConversation}
      createConversation={createConversation}
      moveConversation={moveConversation}
      moveConversationsToFolder={moveConversationsToFolder}
      onImportConversation={(msgs: ImportedMessage[], folderId?: string) =>
        importConversation(msgs, selectedModel, folderId)
      }
    />
  );
}

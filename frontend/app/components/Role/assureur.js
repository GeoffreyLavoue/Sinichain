'use client'
// Importations nécessaires
import { useRef, useState } from 'react';
import { Box, HStack, Flex, Input, Button, useToast } from '@chakra-ui/react';
import { useContractWrite, useContractEvent, usePublicClient } from 'wagmi';
import { abi, insuranceContract, workflowStatus } from '@/app/constants/contract';
import { decodeErrorResult, encodeErrorResult } from 'viem';

export default function Assureur({ currentStatus, account }) {
  const [clientAddress, setClientAddress] = useState('');
  const [clientAdded, setClientAdded] = useState()
  const toast = useToast()
  const toastRef = useRef()

  const { write: addClient, isLoading, isError, error } = useContractWrite({
    ...insuranceContract,
    functionName: 'addClient',
  });

  const { write: creerBon } = useContractWrite({
    ...insuranceContract,
    functionName: 'creerBon',
  });

  const { write: envoyerBon } = useContractWrite({
    ...insuranceContract,
    functionName: 'envoyerBon',
  });

  const { data, isError, isLoading } = useContractRead({
    ...insuranceContract,
    functionName: 'getClientNFTs', // Supposons que cette fonction existe dans le contrat pour obtenir les NFTs
    watch: true
  });



  const handleSubmit = async (e) => {
    e.preventDefault();

    addClient({ args: [clientAddress] });
    setClientAddress('');
  };



  useContractEvent({
    ...insuranceContract,
    eventName: 'ClientRegistered',
    listener(log) {
      console.log(log)
      setClientAdded(true)
    },
  });

  const handleCreerBon = async () => {
    // Ajouter la logique pour créer un bon (par exemple, passer des paramètres si nécessaire)
    creerBon({ args: [/* args here */] });
  };

  const handleEnvoyerBon = async () => {
    // Ajouter la logique pour envoyer un bon (par exemple, passer des paramètres si nécessaire)
    envoyerBon({ args: [/* args here */] });
  };

  useEffect(() => {
    if (data) {
      // Traiter et stocker les données récupérées dans l'état clientNFTs
      setClientNFTs(/* Traitement des données retournées par le contrat */);
    }
  }, [data]);

  // Gérer les erreurs ou le chargement si nécessaire
  if (isLoading) return <div>Chargement des NFTs...</div>;
  if (isError) return <div>Erreur lors du chargement des NFTs</div>;




  return (
    <Box>
      <div>Assureur page</div>
      {currentStatus.name === 'Enregistrement Client' &&
        <Flex>
          <form onSubmit={handleSubmit}>
            <HStack>
              <input
                type="text"
                value={clientAddress}
                onChange={(e) => setClientAddress(e.target.value)}
                placeholder="Enter client's address"
              />
              <Button type="submit">Add Client</Button>
              <Button onClick={handleCreerBon}>Créer Bon</Button>
              <Button onClick={handleEnvoyerBon}>Envoyer Bon</Button>
            </HStack>
          </form>
        </Flex>
      }
      <List>
        {clientNFTs.map((nft, index) => (
          <ListItem key={index}>
            {/* Afficher les informations du NFT */}
            NFT #{nft.id}: {nft.details}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}


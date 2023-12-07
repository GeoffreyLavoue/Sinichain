'use client'
import React from 'react';
import { useEffect, useState } from 'react';
import styles from '../../page.module.css';
import Assureur from '../Role/assureur';
import Client from '../Role/client';
import Personne from '../Role/personne';
import { readContract } from '@wagmi/core'
import { Box, Heading, Flex, Input, Button, useBoolean } from '@chakra-ui/react';
import { insuranceContract, workflowStatus } from '@/app/constants/contract';
import { useAccount, useContractEvent, useContractRead, usePublicClient, useWalletClient } from 'wagmi'
import { parseAbiItem } from 'viem'

const Content = () => {
  const [owner, setOwner] = useState('')
  const [approved, setApprovedAddresses] = useState([])
  const [address, setAddress] = useState('')
  const [currentStatus, setCurrentStatus] = useState('')
  const [changeStatus, setChangeStatus] = useBoolean()
  const [account, setAccount] = useState(undefined)

  const client = usePublicClient();

  const { data: ownerData, isError: OwnerError, isLoading: OwnerLoading } = useContractRead({
    ...insuranceContract,
    functionName: 'owner'
  })

  const { address: addressData, isDisconnected, isConnecting } = useAccount()
  const { data: walletClient, isError, isLoading } = useWalletClient()

  useEffect(() => {
    getApprovedAddresses()
    walletClient && setAccount(prev => walletClient.account)
    ownerData && setOwner(prev => ownerData)
    addressData && setAddress(prev => addressData)
    getCurrentStatus()


    async function getCurrentStatus() {
      try {
        const data = await readContract({
          ...insuranceContract,
          functionName: 'workflowStatus'
        })
        console.log(data)

        setCurrentStatus(prev => workflowStatus[data])
      } catch (err) {
        console.error(err.message)
      }
    }

    async function getApprovedAddresses() {

      const events = await client.getLogs({
        address: insuranceContract.address,
        event: parseAbiItem('event ClientRegistered(address clientAddress)'),
        fromBlock: BigInt(0)
      })

      setApprovedAddresses(prev => events.map(event => event.args.clientAddress))
    }

  }, [ownerData, isConnecting, changeStatus, walletClient, addressData])

  useContractEvent({
    ...insuranceContract,
    eventName: 'WorkflowStatusChange',
    listener(log) {
      console.log(log)
      setCurrentStatus(prev => workflowStatus[log[0].args.newStatus])
    }
  })


  return (
    <>
      <Heading as={'h2'} size={'md'} >Status : {currentStatus.name}</Heading>
      <Box className={styles.center}>
        {
          isDisconnected ? <Personne /> :
            owner === address ?
              <Assureur currentStatus={currentStatus} account={account} setChangeStatus={setChangeStatus} /> : approved.find(approvedAddr => approvedAddr === address) ?
                <Client currentStatus={currentStatus} account={account} client={client} /> : <Personne />
        }
      </Box>
    </>
  )
}
export default Content;

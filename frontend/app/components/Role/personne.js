import React from 'react'
import Image from 'next/image'
import { Box, HStack, Flex, Input, Button } from '@chakra-ui/react';

const personne = () => {
    return (
        <>
            <Box>
                <div>
                    <Image
                        src="/logo.png"
                        alt="Sinichain.js Logo"
                        width={300}
                        height={300}
                        priority />
                </div>
            </Box>
        </>
    )
}

export default personne
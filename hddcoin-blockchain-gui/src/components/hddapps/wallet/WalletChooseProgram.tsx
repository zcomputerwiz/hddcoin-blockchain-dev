import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useWatch } from 'react-hook-form';
import { t, Trans } from '@lingui/macro';
import { Card, Select } from '@hddcoin/core';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Typography,
} from '@material-ui/core';
import { RootState } from '../../../modules/rootReducer';
import Program, { ProgramMap } from '../../../types/HODLProgram';
import StateColor from '../../core/constants/StateColor';
import styled from 'styled-components';

type Props = {
  wallet_id: number;
  //step: number;
  onChange: (program: string) => void;
};

const StyledFormHelperText = styled(FormHelperText)`
  color: ${StateColor.WARNING};
`;

export default function ChooseProgram(props: Props) {
  //const { step, onChange } = props;
  const { wallet_id, onChange } = props;
  const programName: string | undefined = useWatch<string>({name: 'programName'});
  const { availablePrograms } = useSelector((state: RootState) => state.program_configuration);

  function displayablePrograms(programs: ProgramMap<string, Program>): string[] {
    const displayablePrograms = Object.keys(programs) as string[];
    displayablePrograms.sort((a, b) => a.localeCompare(b));
    return displayablePrograms;
  }

  const [displayedPrograms, setDisplayedPrograms] = useState(displayablePrograms(availablePrograms));

  useEffect(() => {
    setDisplayedPrograms(displayablePrograms(availablePrograms));
  }, [availablePrograms]);

  const handleChange = async (event: any) => {
    const selectedProgramName: string = event.target.value as string;
    onChange(selectedProgramName);
  };
/*
  const isProgramInstalled = (programName: string): boolean => {
    const installed = availablePrograms[programName]?.installInfo?.installed ?? false;
    return installed;
  }

  const isProgramSupported = (programName: string): boolean => {
    const installed = availablePrograms[programName]?.installInfo?.installed ?? false;
    const supported = installed || (availablePrograms[programName]?.installInfo?.canInstall ?? false);
    return supported;
  }
*/
  const programDescriptionString = (programName: string | undefined): string | undefined => {
    if (programName) {
      return availablePrograms[programName]
    }
    return undefined;
  };

  const description = programDescriptionString(programName);

  return (
    <Card title={<Trans>Choose Program</Trans>}>
      <Grid container>
        <Grid xs={12} sm={10} md={8} lg={6} item>
          <FormControl variant="filled" fullWidth>
            <InputLabel required focused>
              <Trans>Program</Trans>
            </InputLabel>
            <Select
              name="programName"
              onChange={handleChange}
              value={programName}
            >
              { displayedPrograms.map((program) => (
                <MenuItem value={program} key={program} disabled={false}/*{!isProgramInstalled(program) || !isProgramSupported(program)}*/>
                  {program}
                </MenuItem>
              ))}
            </Select>
            {description && (
              <StyledFormHelperText>
                <Trans>{description}</Trans>
              </StyledFormHelperText>
            )}
          </FormControl>
        </Grid>
      </Grid>
    </Card>
  )
}

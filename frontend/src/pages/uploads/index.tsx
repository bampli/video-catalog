import * as React from "react";
import {
    Card,
    CardContent,
    Divider,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Grid,
    List,
    makeStyles,
    Theme,
    Typography,
} from "@material-ui/core";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import UploadItem from "./UploadItem";
import { Page } from "../../components/Page";
//import {useSelector} from "react-redux";
//import {Upload, UploadModule} from "../../store/upload/types";
import { VideoFileFieldsMap } from "../../util/models";

const useStyles = makeStyles((theme: Theme) => {
    return ({
        panelSummary: {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText
        },
        expandedIcon: {
            color: theme.palette.primary.contrastText
        }
    })
});

const Uploads = () => {
    const classes = useStyles();

    // const uploads = useSelector<UploadModule, Upload[]>(
    //     (state) => state.upload.uploads
    // );

    return (
        <Page title={'Uploads'}>
            {/* {
                uploads.map((upload, key) => ( */}
            <Card elevation={5} >
                <CardContent>
                    <UploadItem>
                        E o vento levou!
                    </UploadItem>
                    <Accordion style={{ margin: 0 }}>
                        <AccordionSummary
                            className={classes.panelSummary}
                            expandIcon={<ExpandMoreIcon className={classes.expandedIcon} />}
                        >
                            <Typography>Ver detalhes</Typography>
                        </AccordionSummary>
                        <AccordionDetails style={{ padding: '0px' }}>
                            <Grid item xs={12}>
                                <List dense={true} style={{ padding: '0px' }}>
                                    <Divider />
                                    <UploadItem >
                                        Principal - nomedoarquivo.mp4
                                    </UploadItem>
                                </List>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </CardContent>
            </Card>
            {/* //     ))
            // } */}
        </Page>
    );
};

export default Uploads;

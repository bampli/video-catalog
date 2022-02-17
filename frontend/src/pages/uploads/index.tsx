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
import { useSelector } from "react-redux";
import { Upload, UploadModule } from "../../store/upload/types";
import { VideoFileFieldsMap } from "../../util/models";
import { Creators } from "../../store/upload";
import { useDispatch } from "react-redux";

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

    const uploads = useSelector<UploadModule, Upload[]>(
        (state) => state.upload.uploads
    );

    const dispatch = useDispatch();

    React.useMemo(() => {
        setTimeout(() => {
            const obj: any = {
                video: {
                    id: '1',
                    title: 'E o vento levou'
                },
                files: [
                    {
                        file: new File([""], "teste.mp4"),
                        fileField: "trailer_file"
                    },
                    {
                        file: new File([""], "teste.mp4"),
                        fileField: "video_file"
                    }
                ]
            }
            dispatch(Creators.addUpload(obj));
            const progress1 = {
                fileField: "trailer_file",
                progress: 10,
                video: { id: '1' }
            } as any;
            dispatch(Creators.updateProgress(progress1));
        }, 1000);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [true]);

    return (
        <Page title={'Uploads'}>
            {
                uploads.map((upload, key) => (
                    <Card elevation={5} key={key}>
                        <CardContent>
                            <UploadItem uploadOrFile={upload}>
                                {upload.video.title}
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
                                            {
                                                upload.files.map((file, key) => (
                                                    <React.Fragment key={key}>
                                                        <Divider />
                                                        <UploadItem uploadOrFile={file}>
                                                            {`${VideoFileFieldsMap[file.fileField]} - ${file.filename}`}
                                                        </UploadItem>
                                                    </React.Fragment>
                                                ))
                                            }
                                        </List>
                                    </Grid>
                                </AccordionDetails>
                            </Accordion>
                        </CardContent>
                    </Card>
                ))
            }
        </Page>
    );
};

export default Uploads;

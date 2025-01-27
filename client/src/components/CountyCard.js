import { useEffect, useState } from 'react';
import { Box, Button, ButtonGroup, Checkbox, FormControl, FormControlLabel, InputLabel, MenuItem, Modal, Select, Tabs, Tab, Typography} from '@mui/material';
import { Bar, BarChart, ResponsiveContainer, Line, LineChart, Legend, XAxis, YAxis, Tooltip } from 'recharts';
import { formatCountyName} from '../helpers/formatter';

const config = require('../config.json');

export default function CountyCard({countyId, handleClose, favorites, setFavorites}) {
    // State to keep track of county name
    const [name, setName] = useState('');
    // State to keep track of county metrics from all dates
    const [countyMetrics, setCountyMetrics] = useState(null);
    // State to keep track of county scores from all dates
    const [countyScores, setCountyScores] = useState(null);
    // State to keep track of whether to display median price
    const [medPrice, setMedPrice] = useState(false);
    // State to keep track of whether to display average price
    const [avgPrice, setAvgPrice] = useState(false);
    // State to keep track of whether to display active listings
    const [activeListings, setActiveListings] = useState(false);
    // State to keep track of whether to display total listings
    const [totalListings, setTotalListings] = useState(false);
    // State to keep track of whether to display median square foot
    const [medSquareFoot, setMedSquareFoot] = useState(false);
    // State to keep track of whether to display hotness
    const [hotness, setHotness] = useState(false);
    // State to keep track of whether to display median price
    const [supply, setSupply] = useState(false);
    // State to keep track of whether to display average price
    const [demand, setDemand] = useState(false);
    // State to keep track of whether to display median price per square foot
    const [pricePerSquareFoot, setPricePerSquareFoot] = useState(false);
    // State to keep track of which info to display
    const [infoToDisplay, setInfoToDisplay] = useState(0);
    // State to keep track of whether the current county is favorited
    const [inFavorites, setInFavorites] = useState(favorites.includes(countyId));
    // State to keep track of average, min, max
    const [allTimeData, setAllTimeData] = useState([]);
    // State to keep track of which data to show for allTimeData
    const [attribute, setAttribute] = useState("Average_Listing_Price");

    // A useEffect Hook to update the data all time averages, maximums, and minimums. These three
    // objects will be stored in the allTimeData state, and will be used in a BarChart
    useEffect(() => {
        fetch(`http://${config.server_host}:${config.server_port}/average_county_info/${countyId}`)
            .then(res => res.json()) 
            .then(resJson => {
                const average = {
                    Type: "Average",
                    Average_Listing_Price: resJson.average_avg,
                    Median_Listing_Price: resJson.median_avg,
                    Total_Listing_Count: resJson.total_avg,
                    Active_Listing_Count: resJson.active_avg,
                    New_Listing_Count: resJson.new_avg,
                    Median_Price_Per_Square_Foot: resJson.median_listing_price_per_square_foot_avg,
                    Median_Square_Feet: resJson.median_square_feet_avg,
                    Hotness: resJson.hotness_avg,
                    Viewers: resJson.viewer_avg,
                    Supply: resJson.supply_avg,
                    Demand: resJson.demand_avg
                }
                fetch(`http://${config.server_host}:${config.server_port}/maximum_county_info/${countyId}`)
                    .then(res => res.json())
                    .then(resJson2 => {
                        const max = {
                            Type: "Maximum",
                            Average_Listing_Price: resJson2.average_max,
                            Median_Listing_Price: resJson2.median_max,
                            Total_Listing_Count: resJson2.total_max,
                            Active_Listing_Count: resJson2.active_max,
                            New_Listing_Count: resJson2.new_max,
                            Median_Price_Per_Square_Foot: resJson2.median_listing_price_per_square_foot_max,
                            Median_Square_Feet: resJson2.median_square_feet_max,
                            Hotness: resJson2.hotness_max,
                            Viewers: resJson2.viewer_max,
                            Supply: resJson2.supply_max,
                            Demand: resJson2.demand_max
                        }
                        fetch(`http://${config.server_host}:${config.server_port}/minimum_county_info/${countyId}`)
                            .then(res => res.json())
                            .then(resJson3 => {
                            const min = {
                                Type: "Minimum",
                                Average_Listing_Price: resJson3.average_min,
                                Median_Listing_Price: resJson3.median_min,
                                Total_Listing_Count: resJson3.total_min,
                                Active_Listing_Count: resJson3.active_min,
                                New_Listing_Count: resJson3.new_min,
                                Median_Price_Per_Square_Foot: resJson3.median_listing_price_per_square_foot_min,
                                Median_Square_Feet: resJson3.median_square_feet_min,
                                Hotness: resJson3.hotness_min,
                                Viewers: resJson3.viewer_min,
                                Supply: resJson3.supply_min,
                                Demand: resJson3.demand_min
                            }
                            setAllTimeData([average, max, min]);
                        }
                    );
                }
            );
        })
    }, []);

    // UseEffect Hook to update all of the other states of the card
    useEffect(() => {
        // Route to get all the relevant data from the county metrics dataset
        fetch(`http://${config.server_host}:${config.server_port}/county_metrics/${countyId}`)
            .then(res => res.json())
            .then(resJson => {
                setCountyMetrics(resJson);
                fetch(`http://${config.server_host}:${config.server_port}/county_name/${countyId}`)
                    .then(res => res.text())
                    .then(resText => {
                        setName(formatCountyName(resText));
                        // Route to get all the relevant data from the county hotness dataset
                        fetch(`http://${config.server_host}:${config.server_port}/county_scores/${countyId}`)
                        .then(res => res.json())
                        .then(resJson => {
                        setCountyScores(resJson);
                    })
                })
            });
        }, []);
    
    // The county card has tabs to change which info gets displayed. This function handles
    // changing which info is displayed
    const handleTabChange = (event, newTabIndex) => {
        setInfoToDisplay(newTabIndex);
    };

    // This function checks if the county is already favorited or not and removes/adds it from/to favorites accordinly.
    const updateFavorites = () => {
        if (inFavorites) {
            setInFavorites(false);
            setFavorites(favorites.filter(id => id !== countyId));
        } else {
            setInFavorites(true);
            setFavorites([...favorites, countyId]);
        }
    }

    return (
        <Modal
            open={true}
            onClose={(handleClose)}
            style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
        >
            <Box
                p={4}
                style={{
                    backgroundColor: 'white',
                    borderRadius: '16px', 
                    border: '3px solid darkgreen',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',  
                    alignItems: 'center',
                    width: 1200 
                }}
            >   
                {/*Display the name of the county*/}
                <Typography variant='h3' color={'darkgreen'} style={{textAlign: 'center', marginTop: '45px', marginBottom: '40px'}}>
                    {name}
                </Typography>
                {/*Tabs to change which data is displayed*/}
                <Tabs value={infoToDisplay} onChange={handleTabChange}>
                    <Tab label="Prices"/>
                    <Tab label="Listings"/>
                    <Tab label="Square Footage"/>
                    <Tab label="Hotness"/>
                    <Tab label="All Time"/>
                </Tabs>
                {/*Render data based on value of infoToDisplay*/}
                {infoToDisplay === 0 && (
                    <Box style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',  
                        alignItems: 'center'
                    }}>
                        {/*Buttons to choose which data you want to see on the line chart*/}
                        <ButtonGroup style={{display: 'flex', alignItems: 'center'}} >
                            <FormControlLabel 
                                control={<Checkbox checked={avgPrice} onChange={() => setAvgPrice(!avgPrice)}/>}
                                label="Avg. Price"
                                labelPlacement='start'
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={medPrice} onChange={() => setMedPrice(!medPrice)}/>}
                                label="Med. Price"
                                labelPlacement='start'
                            />
                        </ButtonGroup>
                        {/*Line Chart*/}
                        <ResponsiveContainer height={250}>
                            <LineChart data={countyMetrics} style={{width: '1100px'}}>
                                <XAxis dataKey="date" interval={'preserveStartEnd'}/>
                                <YAxis></YAxis>
                                <Legend></Legend>
                                <Tooltip></Tooltip>
                                {avgPrice && <Line dataKey="Average" stroke="darkgreen" activeDot={{ r: 8 }}/>}
                                {medPrice && <Line dataKey="Median" stroke="red" activeDot={{ r: 8 }}/>}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
                {infoToDisplay === 1 && (
                    <Box style={{
                        padding: '20px',
                        width: '800',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',  
                        alignItems: 'center'
                    }}>
                        {/*Buttons to choose which data you want to see on the line chart*/}
                        <ButtonGroup style={{display: 'flex', alignItems: 'center'}}>
                            <FormControlLabel 
                                control={<Checkbox checked={activeListings} onChange={() => setActiveListings(!activeListings)}/>}
                                label="Active Listings"
                                labelPlacement='start'
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={totalListings} onChange={() => setTotalListings(!totalListings)}/>}
                                label="Total Listings"
                                labelPlacement='start'
                            />
                        </ButtonGroup>
                        <ResponsiveContainer height={250}>
                            <LineChart data={countyMetrics} style={{width: '1100px'}}>
                                <XAxis dataKey="date" interval={'preserveStartEnd'}></XAxis>
                                <YAxis></YAxis>
                                <Legend></Legend>
                                <Tooltip></Tooltip>
                                {activeListings && <Line dataKey="Active" stroke="darkgreen" activeDot={{ r: 8 }}/>}
                                {totalListings && <Line dataKey="Total" stroke="red" activeDot={{ r: 8 }}/>}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
                {infoToDisplay === 2 && (
                    <Box style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',  
                        alignItems: 'center'
                    }}>
                        {/*Buttons to choose which data you want to see on the line chart*/}
                        <ButtonGroup>
                            <FormControlLabel 
                                control={<Checkbox checked={medSquareFoot} onChange={() => setMedSquareFoot(!medSquareFoot)}/>}
                                label="Median Sq. Feet"
                                labelPlacement='start'
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={pricePerSquareFoot} onChange={() => setPricePerSquareFoot(!pricePerSquareFoot)}/>}
                                label="Median Price Per Sq. Ft."
                                labelPlacement='start'
                            />
                        </ButtonGroup>
                        {/*Line Chart*/}
                        <ResponsiveContainer height={250}>
                            <LineChart data={countyMetrics} style={{width: '1100px'}}>
                                <XAxis dataKey="date" interval={'preserveStartEnd'}></XAxis>
                                <YAxis></YAxis>
                                <Legend></Legend>
                                <Tooltip></Tooltip>
                                {medSquareFoot && <Line dataKey="Square_Feet" stroke="darkgreen" activeDot={{ r: 8 }}/>}
                                {pricePerSquareFoot && <Line dataKey="Square_Price" stroke="red" activeDot={{ r: 8 }}/>}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
                {infoToDisplay === 3 && (
                    <Box style={{
                        padding: '20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',  
                        alignItems: 'center'
                    }}>
                        {/*Buttons to choose which data you want to see on the line chart*/}
                        <ButtonGroup style={{display: 'flex', alignItems: 'center'}} >
                            <FormControlLabel 
                                control={<Checkbox checked={hotness} onChange={() => setHotness(!hotness)}/>}
                                label="Hotness"
                                labelPlacement='start'
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={supply} onChange={() => setSupply(!supply)}/>}
                                label="Supply"
                                labelPlacement='start'
                            />
                            <FormControlLabel 
                                control={<Checkbox checked={demand} onChange={() => setDemand(!demand)}/>}
                                label="Demand"
                                labelPlacement='start'
                            />
                        </ButtonGroup>
                        {/*Line Chart*/}
                        <ResponsiveContainer height={250}>
                            <LineChart data={countyScores} style={{width: '1100px'}}>
                                <XAxis dataKey="date" interval={'preserveStartEnd'}></XAxis>
                                <YAxis></YAxis>
                                <Legend></Legend>
                                <Tooltip></Tooltip>
                                {hotness && <Line dataKey="Hotness" stroke="red" activeDot={{ r: 8 }}/>}
                                {supply && <Line dataKey="Supply" stroke="lightgreen" activeDot={{ r: 8 }}/>}
                                {demand && <Line dataKey="Demand" stroke="darkgreen" activeDot={{ r: 8 }}/>}
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                )}
                {infoToDisplay === 4 &&
                    (
                        <Box style={{
                            padding: '20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',  
                            alignItems: 'center'
                        }}>
                            {/*Drop down box to choose which attribute you want to display*/}
                            <FormControl variant="filled" sx={{minWidth: 120}} style={{marginBottom:"30px"}}> 
                                <InputLabel>Attribute</InputLabel>
                                    <Select
                                        onChange={(e) => setAttribute(e.target.value)}
                                        label="Attribute"
                                        defaultValue={"Average_Listing_Price"}   
                                    >
                                        <MenuItem value={"Average_Listing_Price"}>Average Listing Price</MenuItem>
                                        <MenuItem value={"Median_Listing_Price"}>Median Listing Price</MenuItem>
                                        <MenuItem value={"Total_Listing_Count"}>Total Listing Count</MenuItem>
                                        <MenuItem value={"Active_Listing_Count"}>Active Listing Count</MenuItem>
                                        <MenuItem value={"New_Listing_Count"}>New Listing Count</MenuItem>
                                        <MenuItem value={"Median_Price_Per_Square_Foot"}>Median Price Per Square Foot</MenuItem>
                                        <MenuItem value={"Median_Square_Feet"}>Median Square Feet</MenuItem>
                                        <MenuItem value={"Hotness"}>Hotness</MenuItem>
                                        <MenuItem value={"Viewers"}>Viewers</MenuItem>
                                        <MenuItem value={"Supply"}>Supply</MenuItem>
                                        <MenuItem value={"Demand"}>Demand</MenuItem>
                                    </Select>
                                </FormControl>
                            {/*Bar Chart*/}
                            <ResponsiveContainer height={250}>
                            <BarChart data={allTimeData} style={{width: '1100px'}}>
                                <XAxis dataKey="Type"></XAxis>
                                <YAxis></YAxis>
                                <Legend></Legend>
                                <Tooltip></Tooltip>
                                <Bar dataKey={attribute} fill='#82CA9D' maxBarSize={25}/>
                            </BarChart>
                            </ResponsiveContainer>
                        </Box>
                    )
                }
                {/*Button to update whether or not this county is favorites*/}
                <Button onClick={() => updateFavorites()} style={{ left: '50%', transform: 'translateX(-50%)' }}>
                    {/*Render text based on inFavorites*/}
                    {inFavorites ? "Delete From Favorites" : "Add To Favorites"}
                </Button>
                {/*Button to close the county card*/}
                <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
                    Close
                </Button>
            </Box>
        </Modal>
    )
}
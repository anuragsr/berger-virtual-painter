
<footer id="main-footer" class="style-light">
                <div class="container">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="widget textwidget">
                                <figure>
                                    <img src="img/logo/logo-transparent.png" alt="Logo">
                                </figure>
                                <ul>
                                    <li>
                                        <p><strong>Business Address:</strong></p>
                                        <p><span>102, Oba Akran Avenue, Ikeja Industrial Estate, ikeja Lagos Nigeria</span></p>
                                    </li>
                                    <li>
                                        <p><strong>Phone Numbers:</strong></p>
                                        <p><span>01- 2805169/7, +234 81-0216-4585/6</span></p>
                                    </li>
                                    <li>
                                        <p><strong>E-mail:</strong></p>
                                        <p><span>customercare@bergerpaintnig.com</span></p>
                                    </li>
                                </ul>
                                <ul class="socials">
                                    <li><a href="https://www.facebook.com/BergerPaintsNigeriaPlc"><i class="fa fa-facebook"></i></a></li>
                                <li><a href="https://twitter.com/BergerPaintsNig"><i class="fa fa-twitter"></i></a></li>
                                <li><a href="https://plus.google.com/u/0/114635712535606601287/posts"><i class="fa fa-google-plus"></i></a></li>
                                <li><a href="https://www.youtube.com/channel/UCD_T-Wid299NWbfHxA4rGXg"><i class="fa fa-youtube"></i></a></li>
                                <li><a href="https://instagram.com/bergerpaintsnigeriaplc/"><i class="fa fa-instagram"></i></a></li>
                                <li><a href="https://www.linkedin.com/company/berger-paints-nigeria-plc"><i class="fa fa-linkedin"></i></a></li>
                                <li><a href="http://bergerpaintsnig.com/ourblog/"><i class="fa fa-blog"></i></a></li>
                            </ul>
                            </div><!-- /widget -->
                        </div><!-- /col-md-3 -->
                        <div class="col-md-3">
                        
                            <div class="widget widget_recent_entries">
                          
                                <h3>Popular Posts</h3>
                                <ul>   <?php
        //get all news without video
        foreach($rsMedia as $row_rsMedia) {
            ?>
                                <?php if ($row_rsMedia['type'] == "news") { ?>
                                    <li>
                                        <a href="media-full.php?bp=<?php echo $row_rsMedia['sn']; ?>&cmd=<?php echo $bpn->slug($row_rsMedia['title']); ?>"><?php echo $row_rsMedia['title']; ?></a>
                                        <time datetime="2015-12-05"><?php echo $row_rsMedia['date']; ?></time>
                                    </li>
                                        <?php }?>    <?php }?>
                                </ul>
                            </div><!-- /widget -->
                        </div><!-- /.col-md-3 -->
                        <div class="col-md-3">
                            <div class="widget">
                                <h3>Twitter Feed</h3>
                                <ul class="twitter-feed">
                                    <li>
                                        <div class="tweet-content">
                                            <h5 class="author">John Doe</h5>
                                            <span class="time">3h</span>
                                            <a class="username" href="#">@tweerdoe</a>
                                            <p>#Reddit's UX is horrible. Do you want a redesign?</p>
                                        </div>
                                    </li>
                                    <li>
                                        <div class="tweet-content">
                                            <h5 class="author">John Doe</h5>
                                            <span class="time">3h</span>
                                            <a class="username" href="#">@tweerdoe</a>
                                            <p>#Reddit's UX is horrible. Do you want a redesign?</p>
                                        </div>
                                    </li>
                                </ul>
                            </div><!-- /widget -->
                        </div><!-- /.col-md-3 -->
                        <div class="col-md-3">
                            <div class="widget">
                                <ul class="inline-list list-icon-big transparent m-t-75">
                                <h3>Get Berger APP</h3>
                                <p>Explore the our limitless wourld of colour and virtualization by clicking on any of the links below to download our applications.</p>
                                 
                                <li><a class="username" href="#"><i class="fa fa-apple"></i></a></li>
                                <li><a class="username" href="#"><i class="fa fa-android"></i></a></li>
                            </ul>
                            </div><!-- /widget -->
                        </div><!-- /.col-md-3 -->
                    </div><!-- /row -->
                </div><!-- /container -->
                <div class="bottom-footer">
                    <div class="container">
                        <div class="row">
                            <div class="col-md-12">
                                <div class="copyright"> © Copyright 2017. All rights reserved. <a href="/admin">WEBAdmin</a> | <a href="sitemap">SiteMap</a> |  Developed by <a href="http://www.taglogictech.com" target="_blank"><img src="img/TAG.png" width="40" height="15" alt="TAG Logic Tech"/>™ </a>. </div>
                            </div><!-- /col-md-12 -->
                        </div><!-- /row -->
                    </div><!-- /container -->
                </div><!-- /bottom-footer -->
            </footer>

        </div><!-- /wrapper -->
        